import * as T from 'three';
import { type WorldPlanetData } from '../../lib/net/types.generated';
import { restorePlanetGrid } from './grid';
import { getInvertedMesh } from './gen/invert';
import { scale } from './gen/utils';

export function createPlanetMeshes(data: WorldPlanetData): T.Mesh[] {
    const grid = restorePlanetGrid(data);

    console.log(grid.size());

    const surfaceBuilder = getInvertedMesh(grid);
    const surfaceGeom = surfaceBuilder.build();
    const surfaceMat = new T.MeshStandardMaterial({
        color: 0x5090f0,
        roughness: 0.6,
        metalness: 0.3,
        flatShading: true,
        // vertexColors: true,
    });
    const surfaceMesh = new T.Mesh(surfaceGeom, surfaceMat);

    const boundariesBuilder = grid.clone();
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
