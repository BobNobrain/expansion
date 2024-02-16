import * as T from 'three';
import { type WorldPlanetData } from '../../lib/net/types.generated';
import { restorePlanetGrid } from './grid';
import { getInvertedMesh } from './gen/invert';
import { scale } from './gen/utils';
import { PlanetTileManager } from './gen/tiles';
import { type MeshBuilder } from '../../lib/3d/MeshBuilder';
import { type RawColor } from '../../lib/3d/types';

export function createPlanetMeshes(data: WorldPlanetData): T.Mesh[] {
    const gridBuilder = restorePlanetGrid(data);
    const surfaceBuilder = getInvertedMesh(gridBuilder);

    paintTiles(data, gridBuilder, surfaceBuilder);

    const surfaceGeom = surfaceBuilder.build();
    const surfaceMat = new T.MeshStandardMaterial({
        // color: 0xff00ff,
        roughness: 0.6,
        metalness: 0.3,
        flatShading: true,
        vertexColors: true,
    });
    const surfaceMesh = new T.Mesh(surfaceGeom, surfaceMat);

    const boundariesBuilder = gridBuilder.clone();
    boundariesBuilder.mapVerticies(scale(1.01));
    const boundariesGeom = boundariesBuilder.build();
    const boundariesMat = new T.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.2,
        flatShading: true,
        wireframe: true,
    });
    const boundariesMesh = new T.Mesh(boundariesGeom, boundariesMat);

    return [surfaceMesh, boundariesMesh];
}

function paintTiles(data: WorldPlanetData, grid: MeshBuilder, surface: MeshBuilder) {
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
    console.log(palette);

    tiles.paintSurface(surface);
}

function parseColor(colorString: string): RawColor {
    const rgb = [colorString.substring(0, 2), colorString.substring(2, 4), colorString.substring(4, 6)];
    return rgb.map((hex) => {
        const dec = Number.parseInt(hex, 16);
        return dec / 256;
    }) as RawColor;
}
