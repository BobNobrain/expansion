import * as T from 'three';
import { type MeshBuilder } from '../../lib/3d/MeshBuilder';
import { usePlanetData } from '../../store/world';
import { getInvertedMesh } from './gen/invert';
import { restorePlanetGrid } from './grid';
import { createMemo } from 'solid-js';
import { PlanetTileManager } from './gen/tiles';
import { type RawColor } from '../../lib/3d/types';
import { scale } from './gen/utils';

export type UsePlanetResult = {
    surfaceMesh: () => T.Mesh | null;
    gridMesh: () => T.Mesh | null;

    surfaceBuilder: () => MeshBuilder | null;
    faceIndexMap: () => Record<number, number>;
};

export function usePlanet(): UsePlanetResult {
    const { getData } = usePlanetData('testPlanet');

    const gridBuilder = createMemo(() => {
        const data = getData();
        if (!data) {
            return null;
        }

        return restorePlanetGrid(data);
    });

    const tileManager = createMemo(() => {
        const data = getData();
        if (!data) {
            return null;
        }
        const grid = gridBuilder();
        if (!grid) {
            return null;
        }

        const tiles = new PlanetTileManager(grid, () => null);

        const palette: RawColor[] = [];
        const colorToIndex: Record<string, number> = {};

        for (let tileIndex = 0; tileIndex < data.tiles.length; tileIndex++) {
            const tileData = data.tiles[tileIndex];
            const colorString = tileData.biomeColor;
            let colorIndex = colorToIndex[colorString];
            if (colorIndex === undefined) {
                colorIndex = colorToIndex[colorString] = palette.length;
                palette.push(parseColor(colorString));
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
        console.log('surface painted');
        return surface;
    });

    const surfaceBuilderResult = createMemo(() => {
        const builder = surfaceBuilder();
        if (!builder) {
            return null;
        }

        console.log('surface built');
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

function parseColor(colorString: string): RawColor {
    const rgb = [colorString.substring(0, 2), colorString.substring(2, 4), colorString.substring(4, 6)];
    return rgb.map((hex) => {
        const dec = Number.parseInt(hex, 16);
        return dec / 256;
    }) as RawColor;
}
