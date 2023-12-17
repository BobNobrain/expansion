import { type MeshBuilder } from '../../../lib/3d/MeshBuilder';
import { type RawVertex } from '../../../lib/3d/types';
import { calcCenter } from './utils';

export class PlanetGraph {
    private tiles: PlanetTile[] = [];
    private corners: RawVertex[] = [];

    constructor(builder: MeshBuilder) {
        const size = builder.size();

        for (let vi = 0; vi < size.verticies; vi++) {
            const coords = builder.coords(vi);
            this.tiles.push({
                pos: coords,
                adjacent: [],
                corners: [],
            });
        }

        for (let fi = 0; fi < size.faces; fi++) {
            const face = builder.face(fi);
            const faceCenter = calcCenter(face.map((vi) => builder.coords(vi)));

            this.corners[fi] = faceCenter;
        }
    }
}

type PlanetTile = {
    pos: RawVertex;
    adjacent: number[];
    corners: number[];
};
