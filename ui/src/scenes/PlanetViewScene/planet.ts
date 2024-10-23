import * as T from 'three';
import { type MeshBuilder } from '../../lib/3d/MeshBuilder';
import { getInvertedMesh } from './mesh/invert';
import { restorePlanetGrid } from './mesh/grid';
import { createMemo } from 'solid-js';
import { PlanetTileManager } from './mesh/tiles';
import { type RawColor } from '../../lib/3d/types';
import { scale } from './mesh/utils';
import { type CelestialSurface } from '../../domain/CelstialSurface';
import { Color } from '../../lib/color';

export type UsePlanetResult = {
    surfaceMesh: () => T.Mesh | null;
    gridMesh: () => T.Mesh | null;

    surfaceBuilder: () => MeshBuilder | null;
    faceIndexMap: () => Record<number, number>;
};

export function usePlanet(getSurface: () => CelestialSurface | null): UsePlanetResult {
    // const { getData } = usePlanetData('testPlanet');

    const gridBuilder = createMemo(() => {
        const surface = getSurface();
        if (!surface) {
            return null;
        }

        return restorePlanetGrid(surface);
    });

    const tileManager = createMemo(() => {
        const surface = getSurface();
        if (!surface) {
            return null;
        }
        const grid = gridBuilder();
        if (!grid) {
            return null;
        }

        const tiles = new PlanetTileManager(grid, () => null);

        const palette: RawColor[] = [];
        const colorToIndex: Record<string, number> = {};

        for (let tileIndex = 0; tileIndex < surface.colors.length; tileIndex++) {
            const color = surface.colors[tileIndex];
            const colorString = Color.toHexString(color, { stripAlpha: true });
            let colorIndex = colorToIndex[colorString];
            if (colorIndex === undefined) {
                colorIndex = colorToIndex[colorString] = palette.length;
                palette.push(Color.toRaw(color));
            }

            tiles.setTileColor(tileIndex, colorIndex);
        }

        console.log('PALETTE', palette);
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

        return builder.build();
    });

    const surfaceMesh = createMemo(() => {
        const builderResult = surfaceBuilderResult();
        if (!builderResult) {
            return null;
        }

        const surfaceGeom = builderResult.geometry;
        const surfaceMat = new T.MeshStandardMaterial({
            roughness: 0.6,
            metalness: 0.3,
            flatShading: true,
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
        const boundariesGeom = boundariesBuilder.build().geometry;
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
