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
};

enum Colors {
    Plains,
    Ocean,
    DeepOcean,
    Islands,
    Mountains,
    Forest,
    Desert,
    Arctic,
}

const palette: RawColor[] = [
    [0.2, 0.6, 0.1],
    [0.0, 0.2, 0.5],
    [0.1, 0.3, 0.7],
    [0.1, 0.9, 1.0],
    [0.6, 0.5, 0.4],
    [0.1, 0.4, 0.2],
    [0.7, 0.9, 0.2],
    [0.95, 0.95, 1],
];

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
        }),
    );
    // tiles.setPalette(palette);
    tiles.setPalette(heightsPalette);

    const connections = graph.calculateConnectionMap();
    const vn = connections.length;

    const landscape: LandscapeOptions = {
        nPlates: landscapeOpts.nPlates ?? Math.max(3, Math.min(Math.floor(vn / 40), 20)),
        oceanPercentage: landscapeOpts.oceanPercentage ?? 0.6,
        minPlateSize: Math.max(3, Math.min(Math.floor(vn / 120), 10)),
        extremeness: landscapeOpts.extremeness ?? 0.7,
        oceanToLandGap: landscapeOpts.oceanToLandGap ?? 0.2,
        slopeFactor: landscapeOpts.slopeFactor ?? 0.1,
        blurFactor: landscapeOpts.blurFactor ?? 0.1,
        noiseFactor: landscapeOpts.noiseFactor ?? 0.1,
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

    for (let vi = 0; vi < vn; vi++) {
        const tileData = tiles.getTile(vi).data;
        // const plateData = plates[tileData.plateIndex];
        // tiles.setTileColor(vi, Math.floor(((plateData.elevation + 1) / 2) * heightsPalette.length));
        tiles.setTileColor(vi, Math.floor(((tileData.elevation + 1) / 2) * heightsPalette.length));
    }

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

        tileData.elevation = Math.max(-1, Math.min(tileData.elevation + dH, 0.999));
    }
}
