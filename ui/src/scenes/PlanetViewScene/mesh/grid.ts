import { type CelestialSurface } from '../../../domain/World';
import { MeshBuilder } from '../../../lib/3d/MeshBuilder';

export function restorePlanetGrid({ grid }: CelestialSurface): MeshBuilder {
    const { coords, edges } = grid;
    const builder = new MeshBuilder();

    for (let i = 0; i < coords.length; i += 3) {
        builder.add(coords[i], coords[i + 1], coords[i + 2]);
    }

    for (let vi = 0; vi < edges.length; vi++) {
        const connecteds = edges[vi];
        const l = connecteds.length;

        for (let j = 0; j < l; j++) {
            const vj = connecteds[j];

            for (let k = j + 1; k < l; k++) {
                const vk = connecteds[k];
                if (vk === vi) {
                    continue;
                }

                const vMin = Math.min(vj, vk);
                const vMax = Math.max(vj, vk);
                const areConnected = edges[vMin].includes(vMax);

                if (!(vi < vMin && vMin < vMax)) {
                    console.log({ vi, vj, vk, vMin, vMax });
                }

                if (areConnected) {
                    builder.assembleVerticies([vi, vMin, vMax]);
                }
            }
        }
    }

    return builder;
}
