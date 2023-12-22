import { type MeshBuilder } from '../../../lib/3d/MeshBuilder';
import { type RandomSequence } from '../../../lib/random';
import { drawInteger } from '../../../lib/random/utils';

type RotatorOptions = {
    builder: MeshBuilder;
    seq: RandomSequence;
    minRotations?: number;
    maxRotations?: number;
};

export function rotateRandomEdges({ builder, seq, minRotations = 10, maxRotations = 30 }: RotatorOptions): void {
    const size = builder.size();
    const nRotations = drawInteger(seq, { min: minRotations, max: maxRotations });

    // const facesDone = new Set<number>();
    const verticiesTouched = new Set<number>();
    for (let vi = 0; vi < 12; vi++) {
        // first 12 verticies are from initial icosahedron,
        // and they must not be touched
        verticiesTouched.add(vi);
    }

    for (let r = 0; r < nRotations; r++) {
        if (size.verticies <= verticiesTouched.size) {
            break;
        }
        // if (size.faces <= facesDone.size) {
        //     break;
        // }

        const face1Index = drawInteger(seq, { min: 0, max: size.faces });
        // if (facesDone.has(face1Index)) {
        //     continue;
        // }

        const face1 = builder.face(face1Index);
        if (face1.some((v) => verticiesTouched.has(v))) {
            continue;
        }

        const targetEdgeStartIndex = drawInteger(seq, { min: 0, max: face1.length });
        const targetEdgeEndIndex = targetEdgeStartIndex === face1.length - 1 ? 0 : targetEdgeStartIndex + 1;
        const targetEdgeStart = face1[targetEdgeStartIndex];
        const targetEdgeEnd = face1[targetEdgeEndIndex];

        const face2Index = builder
            .findConnectedFaces([targetEdgeStart, targetEdgeEnd])
            .filter((fi) => fi !== face1Index)[0];

        // if (facesDone.has(face2Index)) {
        //     continue;
        // }

        const face2 = builder.face(face2Index);
        if (face2.some((v) => verticiesTouched.has(v))) {
            continue;
        }

        // facesDone.add(face1Index);
        // facesDone.add(face2Index);
        face1.forEach((v) => verticiesTouched.add(v));
        face2.forEach((v) => verticiesTouched.add(v));

        const oppositeVertex1 = face1.filter((vi) => vi !== targetEdgeStart && vi !== targetEdgeEnd)[0];
        const oppositeVertex2 = face2.filter((vi) => vi !== targetEdgeStart && vi !== targetEdgeEnd)[0];

        builder.replaceFace(face1Index, [oppositeVertex1, targetEdgeStart, oppositeVertex2]);
        builder.replaceFace(face2Index, [oppositeVertex2, targetEdgeEnd, oppositeVertex1]);
    }
}
