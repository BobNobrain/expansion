import { type MeshBuilder } from './MeshBuilder';
import { type RawVertex } from './types';

/** Calculates an array of verticies that will form an outline of given tile group (the group must be continuous) */
export function getTilesOutline(builder: MeshBuilder, tiles: Iterable<number>): RawVertex[] {
    const edges = new Map<number, Set<number>>();

    for (const ti of tiles) {
        const face = builder.face(ti);
        const faceEdges: [number, number][] = [];

        for (let i = 0; i < face.length - 1; i++) {
            faceEdges.push([face[i], face[i + 1]]);
        }
        faceEdges.push([face[face.length - 1], face[0]]);

        for (const [a, b] of faceEdges) {
            const ao = builder.getOriginalVertexIndex(a);
            const bo = builder.getOriginalVertexIndex(b);
            const min = Math.min(ao, bo);
            const max = Math.max(ao, bo);

            if (!edges.has(min)) {
                edges.set(min, new Set([max]));
                continue;
            }

            const outwards = edges.get(min)!;
            if (outwards.has(max)) {
                // second time meeting the edge = it's an inner edge, as both its faces are in `tiles`
                outwards.delete(max);
                continue;
            }

            outwards.add(max);
        }
    }

    for (const edgeStart of edges.keys()) {
        if (edges.get(edgeStart)!.size === 0) {
            edges.delete(edgeStart);
        }
    }

    // mirroring the edges map
    for (const [start, ends] of edges.entries()) {
        for (const end of ends.values()) {
            let s = edges.get(end);
            if (!s) {
                s = new Set();
                edges.set(end, s);
            }

            s.add(start);
        }
    }

    let current = edges.keys().next().value!;

    if (current === undefined) {
        throw new Error('Somehow, there is no edges surrounding your tile set');
    }

    const vis: number[] = [current];

    while (edges.size > 0) {
        const nextPossiblePoints = edges.get(current)!;

        const next = nextPossiblePoints.values().next().value!;
        const nextNextPossiblePoints = edges.get(next)!;

        if (nextPossiblePoints.size === 1) {
            edges.delete(current);
        } else {
            nextPossiblePoints.delete(next);
        }

        if (nextNextPossiblePoints.size === 1) {
            edges.delete(next);
        } else {
            nextNextPossiblePoints.delete(current);
        }

        vis.push(next);
        current = next;
    }

    return vis.map((vi) => builder.coords(vi));
}
