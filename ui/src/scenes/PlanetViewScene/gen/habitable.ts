import { type MeshBuilder } from '../../../lib/3d/MeshBuilder';
import { type RawVertex, type RawColor } from '../../../lib/3d/types';
import { type RandomSequence } from '../../../lib/random';
import { drawDistinctIntegers } from '../../../lib/random/utils';
import { type PlanetTile, PlanetTileManager } from './tiles';
import * as utils from './utils';

export type HabitablePlanetOptions = {
    seq: RandomSequence;
    graph: MeshBuilder;
} & Partial<LandscapeOptions>;

type LandscapeOptions = {
    /** integer */
    nPlates: number;
    /** probability for a plate to be oceanic */
    oceanPercentage: number;
    /** plates with less nodes than this will be attached to the biggest neighbour */
    minPlateSize: number;
    /** scale of initial plate elevation (before subducting, blurring and noising) */
    extremeness: number;
    /** Size of an elevations gap around 0 to separate land and ocean plates */
    oceanToLandGap: number;
    /** how much plate subducting affects elevation at their border */
    slopeFactor: number;
    /** amount of random noise added for each tile's elevation */
    noiseFactor: number;
    /** how much blur is added: 0=none, 1=everything will try to even out */
    blurFactor: number;
    /** how much moisture spread passes to do at max */
    moistureIterations: number;
    /** max moisture amount spread per pass */
    moistureTransfer: number;
};

enum Biome {
    Unknown,
    Ocean,
    DeepOcean,
    FrozenOcean,
    Islands,
    Desert,
    Savanna,
    Plains,
    Tundra,
    Arctic,
    Forest,
    WetForest,
    Taiga,
    Mountains,
}

const biomeColors: Record<Biome, RawColor> = {
    [Biome.Unknown]: [1, 0, 1],
    [Biome.Ocean]: [0.12, 0.36, 0.85],
    [Biome.DeepOcean]: [0.0, 0.2, 0.5],
    [Biome.FrozenOcean]: [0.5, 0.8, 1],
    [Biome.Islands]: [0.33, 0.91, 0.97],
    [Biome.Desert]: [1, 0.92, 0.42],
    [Biome.Savanna]: [0.72, 0.87, 0.38],
    [Biome.Plains]: [0.33, 0.91, 0.18],
    [Biome.Tundra]: [0.53, 0.62, 0.3],
    [Biome.Arctic]: [0.92, 0.98, 0.99],
    [Biome.Forest]: [0.26, 0.51, 0.13],
    [Biome.WetForest]: [0.07, 0.73, 0.03],
    [Biome.Taiga]: [0.15, 0.53, 0.36],
    [Biome.Mountains]: [0.59, 0.57, 0.5],
};

const palette = Object.entries(biomeColors).reduce<RawColor[]>((acc, [biome, color]) => {
    acc[Number(biome)] = color;
    return acc;
}, []);

const heightsPalette: RawColor[] = [
    [0.0, 0.0, 0.4],
    [0.0, 0.1, 0.6],
    [0.1, 0.2, 0.8],
    [0.1, 0.5, 1.0],
    [0.2, 0.7, 1.0],
    [0.9, 0.9, 0.9],
    [0.5, 0.8, 0.3],
    [0.2, 0.5, 0.1],
    [0.9, 0.5, 0.0],
    [1.0, 0.3, 0.0],
];

type HabitableTileData = {
    plateIndex: number;
    elevation: number;
    plateMovement: RawVertex | null;
    moisture: number;
    biome: Biome;
};

type PlateData = {
    centralPoint: RawVertex;
    elevation: number;
    movement: {
        angle: number; // when looking onto the tile from sky, top aligned with planet's north pole (y=1)
        angleCos: number;
        angleSin: number;
        mag: number;
    };
};

type PTM = PlanetTileManager<HabitableTileData>;

const ALMOST1 = 0.9999;

export function generateHabitablePlanet({
    graph,
    seq,
    ...landscapeOpts
}: HabitablePlanetOptions): PlanetTileManager<HabitableTileData> {
    const tiles = new PlanetTileManager(
        graph,
        (): HabitableTileData => ({
            plateIndex: -1,
            elevation: 0,
            plateMovement: null,
            moisture: 0,
            biome: Biome.Plains,
        }),
    );
    tiles.setPalette(palette);
    // tiles.setPalette(heightsPalette);

    const connections = graph.calculateConnectionMap();
    const vn = connections.length;

    const landscape: LandscapeOptions = {
        nPlates: landscapeOpts.nPlates ?? Math.max(3, Math.min(Math.floor(vn / 40), 20)),
        oceanPercentage: landscapeOpts.oceanPercentage ?? 0.6,
        minPlateSize: Math.max(3, Math.min(Math.floor(vn / 120), 10)),
        extremeness: landscapeOpts.extremeness ?? 0.6,
        oceanToLandGap: landscapeOpts.oceanToLandGap ?? 0.2,
        slopeFactor: landscapeOpts.slopeFactor ?? 0.3,
        blurFactor: landscapeOpts.blurFactor ?? 0.1,
        noiseFactor: landscapeOpts.noiseFactor ?? 0.1,
        moistureIterations: landscapeOpts.moistureIterations ?? 20,
        moistureTransfer: landscapeOpts.moistureTransfer ?? 0.8,
    };
    const { nPlates } = landscape;

    const plateNodes = floodFillPlates(seq, connections, nPlates);
    const plates = generatePlates(seq, landscape);

    for (let pi = 0; pi < nPlates; pi++) {
        const plateData = plates[pi];
        const nodes = plateNodes[pi];

        calcPlateCenter(plateData, nodes, graph);

        for (const node of nodes) {
            tiles.getTile(node).data.plateIndex = pi;
        }
    }

    eatSmallPlates(tiles, plateNodes, connections, landscape);

    calculateElevationMap(plates, tiles, connections, landscape);
    blurAndNoiseElevations(seq, tiles, connections, landscape);
    calculateMoisture(tiles, connections, landscape);
    calculateBiomes(tiles);

    for (let vi = 0; vi < vn; vi++) {
        const tileData = tiles.getTile(vi).data;
        // const plateData = plates[tileData.plateIndex];
        // tiles.setTileColor(vi, Math.floor(((plateData.elevation + 1) / 2) * heightsPalette.length));
        // tiles.setTileColor(vi, Math.floor(((tileData.elevation + 1) / 2) * heightsPalette.length));
        // tiles.setTileColor(vi, Math.floor((1 - (tileData.moisture || 0.001)) * heightsPalette.length));
        tiles.setTileColor(vi, tileData.biome);
    }

    // @ts-expect-error 111
    window.tiles = tiles;

    return tiles;
}

function generatePlates(
    seq: RandomSequence,
    { nPlates, oceanPercentage, extremeness, oceanToLandGap }: LandscapeOptions,
): PlateData[] {
    const result = new Array<PlateData>(nPlates);
    const halfGap = oceanToLandGap / 2;

    for (let pi = 0; pi < nPlates; pi++) {
        const isOcean = seq() < oceanPercentage;
        const plateElevation = seq() * (extremeness - halfGap) + halfGap;
        const moveAmount = seq();
        const moveAngle = (2 * seq() - 1) * Math.PI;

        result[pi] = {
            centralPoint: [0, 0, 0],
            elevation: isOcean ? -plateElevation : plateElevation,
            movement: {
                angle: moveAngle,
                angleCos: Math.cos(moveAngle),
                angleSin: Math.sin(moveAngle),
                mag: moveAmount,
            },
        };
    }
    return result;
}

function floodFillPlates(seq: RandomSequence, connections: Set<number>[], nPlates: number): Set<number>[] {
    const plates = new Array<null>(nPlates).fill(null).map(() => new Set<number>());
    const visitedNodes = new Set<number>();
    const floodQueues = new Array<number[]>(nPlates);
    const floodFillStarts = Array.from(
        drawDistinctIntegers(seq, nPlates, { min: 0, max: connections.length }).values(),
    );

    for (let pi = 0; pi < nPlates; pi++) {
        const firstPlateNode = floodFillStarts[pi];
        floodQueues[pi] = [firstPlateNode];
    }

    let hasNonEmptyQueue = true;
    while (hasNonEmptyQueue) {
        hasNonEmptyQueue = false;

        for (let pi = 0; pi < nPlates; pi++) {
            const plate = plates[pi];
            const queue = floodQueues[pi];
            const nextNode = queue.shift();
            if (nextNode === undefined) {
                continue;
            }

            hasNonEmptyQueue = true;
            if (!visitedNodes.has(nextNode)) {
                plate.add(nextNode);
                visitedNodes.add(nextNode);
            }

            const neighbouringNodes = connections[nextNode];
            for (const neighbouringNode of neighbouringNodes) {
                if (visitedNodes.has(neighbouringNode)) {
                    continue;
                }

                queue.push(neighbouringNode);
            }
        }
    }

    return plates;
}

function calcPlateCenter(plate: PlateData, nodes: Set<number>, graph: MeshBuilder) {
    const plateNodeCoords: RawVertex[] = [];
    for (const vi of nodes) {
        plateNodeCoords.push(graph.coords(vi));
    }
    plate.centralPoint = utils.normz(utils.calcCenter(plateNodeCoords));
}

function getPlateMovementAtTile(plate: PlateData, tile: PlanetTile<HabitableTileData>): RawVertex {
    if (!tile.data.plateMovement) {
        const tileNormal = tile.pos;
        const north: RawVertex = [0, 1, 0];
        const tileNorth = utils.normz(utils.diff(north, utils.mul(tileNormal, utils.dot(north, tileNormal))));
        const tileEast = utils.cross(tileNorth, tileNormal);

        const movementDir = utils.sum(
            utils.mul(tileNorth, plate.movement.angleSin),
            utils.mul(tileEast, plate.movement.angleCos),
        );

        tile.data.plateMovement = utils.mul(movementDir, plate.movement.mag);
    }

    return tile.data.plateMovement;
}

function calculateElevationMap(
    plates: PlateData[],
    tiles: PTM,
    connections: Set<number>[],
    { slopeFactor, oceanToLandGap }: LandscapeOptions,
) {
    for (let vi = 0; vi < connections.length; vi++) {
        const tile = tiles.getTile(vi);
        const neighbours = Array.from(connections[vi].values());
        const tilePlate = plates[tile.data.plateIndex];

        tile.data.elevation = tilePlate.elevation;
        const plateMovementAtTile = getPlateMovementAtTile(tilePlate, tile);

        for (const neighbour of neighbours) {
            const neighbourTile = tiles.getTile(neighbour);
            const neighbourPlateIndex = neighbourTile.data.plateIndex;
            if (neighbourPlateIndex === tile.data.plateIndex) {
                continue;
            }

            const neighbourPlate = plates[neighbourPlateIndex];
            const plateMovementAtNeighbour = getPlateMovementAtTile(neighbourPlate, neighbourTile);
            const plateElevationsDiff = tilePlate.elevation - neighbourPlate.elevation;

            const dot = utils.dot(plateMovementAtTile, plateMovementAtNeighbour);
            if (Math.abs(dot) < 0.05) {
                // plates are not very much colliding or running away
                // maybe add some border friction and volcanic activity later
                continue;
            }

            if (dot < 0) {
                if (Math.abs(plateElevationsDiff) > oceanToLandGap) {
                    // one of the plates is being subducted
                    tile.data.elevation += plateElevationsDiff * slopeFactor;
                } else {
                    // plates just collide
                    tile.data.elevation += Math.abs(plateElevationsDiff) * slopeFactor;
                }
            } else {
                tile.data.elevation -= Math.abs(plateElevationsDiff) * slopeFactor;
            }
        }

        tile.data.elevation = Math.max(-1, Math.min(tile.data.elevation, 0.999));
    }
}

function eatSmallPlates(
    tiles: PTM,
    plateNodes: Set<number>[],
    connections: Set<number>[],
    { minPlateSize }: LandscapeOptions,
) {
    for (let pi = 0; pi < plateNodes.length; pi++) {
        if (plateNodes.length >= minPlateSize) {
            continue;
        }

        const plateNeighbours = new Set<number>();
        for (const node of plateNodes[pi]) {
            const nodeNeighbours = connections[node];
            for (const neighbour of nodeNeighbours) {
                plateNeighbours.add(neighbour);
            }
        }

        const neighbouringPlatesPresence: Record<number, number> = {};
        for (const neighbour of plateNeighbours) {
            const plateIndex = tiles.getTile(neighbour).data.plateIndex;
            if (plateIndex === pi) {
                continue;
            }

            if (!neighbouringPlatesPresence[plateIndex]) {
                neighbouringPlatesPresence[plateIndex] = 0;
            }
            ++neighbouringPlatesPresence[plateIndex];
        }

        let biggestNeighbourIndex = -1;
        let biggestNeighbourSize = 0;
        for (const [plateIndexStr, size] of Object.entries(neighbouringPlatesPresence)) {
            if (size > biggestNeighbourSize) {
                const plateIndex = Number(plateIndexStr);
                biggestNeighbourIndex = plateIndex;
                biggestNeighbourSize = size;
            }
        }

        if (biggestNeighbourIndex === -1) {
            continue;
        }

        for (const node of plateNodes[pi]) {
            tiles.getTile(node).data.plateIndex = biggestNeighbourIndex;
        }
    }
}

function blurAndNoiseElevations(
    seq: RandomSequence,
    tiles: PTM,
    connections: Set<number>[],
    { blurFactor, noiseFactor }: LandscapeOptions,
) {
    for (let vi = 0; vi < connections.length; vi++) {
        const { data: tileData } = tiles.getTile(vi);
        const neighbours = Array.from(connections[vi].values());

        let dH = 0;
        dH += (seq() * 2 - 1) * noiseFactor;

        for (const neighbour of neighbours) {
            dH += (tiles.getTile(neighbour).data.elevation - tileData.elevation) * blurFactor;
        }
        dH /= neighbours.length;

        tileData.elevation = Math.max(-1, Math.min(tileData.elevation + dH, ALMOST1));
    }
}

function calculateMoisture(
    tiles: PTM,
    connections: Set<number>[],
    { moistureIterations, moistureTransfer }: LandscapeOptions,
) {
    const vn = connections.length;
    const calculatedTiles = new Set<number>();
    const closestNeighbours = new Set<[number, number]>();

    for (let vi = 0; vi < vn; vi++) {
        const tile = tiles.getTile(vi);
        const isWatery = tile.data.elevation <= 0;

        if (isWatery) {
            tile.data.moisture = ALMOST1;
            calculatedTiles.add(vi);
        }
    }

    for (let i = 0; i < moistureIterations; i++) {
        for (const vi of calculatedTiles) {
            for (const nvi of connections[vi]) {
                if (calculatedTiles.has(nvi)) {
                    continue;
                }

                closestNeighbours.add([vi, nvi]);
            }
        }

        console.log({ i, calc: calculatedTiles.size, close: closestNeighbours.size });

        for (const [vi, nvi] of closestNeighbours) {
            const srcTile = tiles.getTile(vi).data;
            const destTile = tiles.getTile(nvi).data;

            const transferBlockByHeightPercentage = Math.max(0, destTile.elevation - Math.max(0, srcTile.elevation));
            const moistureToTransfer =
                (1 - transferBlockByHeightPercentage) * Math.min(srcTile.moisture * moistureTransfer);

            destTile.moisture = Math.max(moistureToTransfer, destTile.moisture);
            calculatedTiles.add(nvi);
        }

        if (calculatedTiles.size === vn) {
            break;
        }

        closestNeighbours.clear();
    }
}

function calculateBiomes(tiles: PTM) {
    const vn = tiles.size();
    for (let vi = 0; vi < vn; vi++) {
        const tile = tiles.getTile(vi);
        const moisture = tile.data.moisture;
        const height = tile.data.elevation;
        const warmth = 1 - Math.abs(tile.pos[1]);

        tile.data.biome = getBiome({ moisture, height, warmth });
    }
}

function getBiome(t: { moisture: number; warmth: number; height: number }): Biome {
    if (t.height >= 0.7) {
        return Biome.Mountains;
    }

    if (t.height < -0.05) {
        if (t.warmth < 0.1) {
            return Biome.FrozenOcean;
        }

        return t.height < -0.5 ? Biome.DeepOcean : Biome.Ocean;
    }

    if (t.warmth < 0.15) {
        return Biome.Arctic;
    }

    if (t.height < 0.05) {
        return Biome.Islands;
    }

    if (t.warmth < 0.4) {
        return t.moisture < 0.5 ? Biome.Tundra : Biome.Taiga;
    }
    if (t.warmth < 0.7) {
        if (t.moisture < 0.1) {
            return Biome.Desert;
        }
        return t.moisture < 0.5 ? Biome.Plains : Biome.Forest;
    }

    if (t.moisture < 0.3) {
        return Biome.Desert;
    }
    if (t.moisture < 0.5) {
        return Biome.Savanna;
    }
    return Biome.WetForest;
}
