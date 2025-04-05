import { createMemo } from 'solid-js';
import * as T from 'three';
import { type World } from '../../domain/World';
import { type MeshBuilder } from '../../lib/3d/MeshBuilder';
import { type MaterialData } from '../../lib/3d/material';
import { type RawFace } from '../../lib/3d/types';
import { Color } from '../../lib/color';
import { pickRenderer } from './colors';
import { getInvertedMesh } from './mesh/invert';
import { restorePlanetGrid } from './mesh/grid';
import { PlanetTileManager } from './mesh/tiles';
import { scale, calcCenter, normz } from './mesh/utils';
import { type RenderMode } from './settings';

export type UsePlanetResult = {
    surfaceMesh: () => T.Mesh | null;
    gridMesh: () => T.Mesh | null;

    surfaceBuilder: () => MeshBuilder | null;
    faceIndexMap: () => Record<number, number>;
};

export function usePlanet(getWorld: () => World | null, getMode: () => RenderMode): UsePlanetResult {
    const gridBuilder = createMemo(() => {
        const world = getWorld();
        if (!world || !world.grid.coords.length) {
            return null;
        }

        return restorePlanetGrid(world);
    });

    const tileManager = createMemo(() => {
        const world = getWorld();
        if (!world) {
            return null;
        }
        const grid = gridBuilder();
        if (!grid) {
            return null;
        }

        const tiles = new PlanetTileManager(grid, () => null);

        const palette: MaterialData[] = [];
        const colorToIndex: Record<string, number> = {};
        const renderer = pickRenderer(getMode());
        const materials = renderer(world);

        for (let tileIndex = 0; tileIndex < materials.length; tileIndex++) {
            const color = materials[tileIndex];
            const colorString = Color.toHexString(color.reflective, { stripAlpha: true });
            let colorIndex = colorToIndex[colorString];
            if (colorIndex === undefined) {
                colorIndex = colorToIndex[colorString] = palette.length;
                palette.push(color);
            }

            tiles.setTileColor(tileIndex, colorIndex);
        }

        tiles.setPalette(palette);
        return tiles;
    });

    const surfaceBuilder = createMemo(() => {
        const grid = gridBuilder();
        if (!grid) {
            return null;
        }
        const tiles = tileManager();
        if (!tiles) {
            return null;
        }

        const surface = getInvertedMesh(grid);
        tiles.paintSurface(surface);
        return surface;
    });

    const surfaceBuilderResult = createMemo(() => {
        const builder = surfaceBuilder();
        if (!builder) {
            return null;
        }

        return builder.clone().buildTriangulated(planetTriangulator);
    });

    const surfaceMesh = createMemo(() => {
        const builderResult = surfaceBuilderResult();
        if (!builderResult) {
            return null;
        }

        const surfaceGeom = builderResult.geometry;
        const surfaceMat = new T.MeshStandardMaterial({
            roughness: 0.9,
            userData: true,
            flatShading: false,
            vertexColors: true,
        });

        return new T.Mesh(surfaceGeom, surfaceMat);
    });
    const gridMesh = createMemo(() => {
        const builder = gridBuilder();
        if (!builder) {
            return null;
        }

        const boundariesBuilder = builder.clone();
        boundariesBuilder.mapVerticies(scale(1.01));
        const boundariesGeom = boundariesBuilder.buildTriangulated().geometry;
        const boundariesMat = new T.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.2,
            flatShading: true,
            wireframe: true,
        });
        return new T.Mesh(boundariesGeom, boundariesMat);
    });

    const faceIndexMap = createMemo(() => surfaceBuilderResult()?.faceIndexMap ?? {});

    return {
        surfaceBuilder,
        surfaceMesh,
        gridMesh,
        faceIndexMap,
    };
}

// Adds a center point on each tile
function planetTriangulator(vs: number[], builder: MeshBuilder): RawFace[] {
    const middleCoords = normz(calcCenter(vs.map((vi) => builder.coords(vi))));
    const result: RawFace[] = [];
    const middle = builder.add(...middleCoords);
    builder.paintVertex(middle, builder.getVertexMaterial(vs[0])!);

    for (let i = 0; i < vs.length - 1; i++) {
        result.push([middle, vs[i], vs[i + 1]]);
    }
    result.push([middle, vs[vs.length - 1], vs[0]]);

    return result;
}
