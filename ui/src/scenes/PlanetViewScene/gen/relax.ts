import { type MeshBuilder } from '../../../lib/3d/MeshBuilder';
import { type RawVertex } from '../../../lib/3d/types';
import { type RandomSequence } from '../../../lib/random';
import * as utils from './utils';

export type RelaxOptions = {
    maxPasses?: number;
    minChange?: number;
    changeRate?: number;
    eps?: number;
    targetEdgeLength: number;
    mode?: 'edge' | 'centroid';
    seq: RandomSequence;
};

type Relaxer = {
    pass(i: number): number;
};

export function relaxMesh(
    builder: MeshBuilder,
    {
        targetEdgeLength,
        maxPasses = 100,
        minChange = 1e-4,
        eps = 1e-4,
        changeRate = 0.01,
        mode = 'centroid',
        seq,
    }: RelaxOptions,
): void {
    const minChangeSquared = minChange * minChange;

    let relaxer: Relaxer;
    switch (mode) {
        case 'centroid':
            relaxer = new CentroidRelaxer(builder, { targetEdgeLength, eps, changeRate, seq });
            break;

        case 'edge':
            relaxer = new EdgeLengthRelaxer(builder, { targetEdgeLength, eps, changeRate, seq });
            break;
    }

    let pass = 0;
    for (pass = 0; pass < maxPasses; pass++) {
        const maxChangeDoneSquared = relaxer.pass(pass);

        if (maxChangeDoneSquared < minChangeSquared) {
            console.log('min change reached at pass', pass);
            break;
        }
    }
    console.log('relaxed in passes of ', pass);
}

class EdgeLengthRelaxer {
    private nVerticies: number;
    private connections: Set<number>[];
    private targetLengthSquared: number;
    private eps: number;
    private changeRate: number;
    private seq: RandomSequence;

    constructor(
        private builder: MeshBuilder,
        { targetEdgeLength, eps = 1e-4, changeRate = 0.05, seq }: RelaxOptions,
    ) {
        this.nVerticies = builder.size().verticies;
        this.connections = builder.calculateConnectionMap();
        this.targetLengthSquared = targetEdgeLength * targetEdgeLength;
        this.eps = eps;
        this.changeRate = changeRate;
        this.seq = seq;
    }

    pass(_iterationNumber: number) {
        const { builder, connections, targetLengthSquared, eps, changeRate } = this;
        const forcesByVertex = new Array<RawVertex>(this.nVerticies).fill(utils.ZERO);

        for (let vi = 0; vi < this.nVerticies; vi++) {
            for (const connectedVertex of connections[vi]) {
                const targetV = builder.coords(vi);
                const neighbourV = builder.coords(connectedVertex);
                const edge = utils.diff(targetV, neighbourV);
                const edgeLengthSquared = utils.sizeSquared(edge);

                const lenghtsDelta = Math.sqrt(targetLengthSquared) - Math.sqrt(edgeLengthSquared);
                if (Math.abs(lenghtsDelta) < eps) {
                    continue;
                }

                const force: RawVertex = utils.mul(edge, lenghtsDelta);
                forcesByVertex[vi] = utils.sum(forcesByVertex[vi], force);
            }
        }

        let maxChangeDoneSquared = 0;
        for (let vi = 0; vi < this.nVerticies; vi++) {
            const totalForce = forcesByVertex[vi];
            const noisedTotalForce = withRandomShift(this.seq, utils.size(totalForce) / 10, totalForce);

            const vertex = builder.coords(vi);
            builder.setCoords(vi, utils.normz(utils.sum(vertex, utils.mul(noisedTotalForce, changeRate))));

            const changeDoneSquared = utils.sizeSquared(totalForce) * changeRate;

            if (maxChangeDoneSquared < changeDoneSquared) {
                maxChangeDoneSquared = changeDoneSquared;
            }
        }

        return maxChangeDoneSquared;
    }
}

class CentroidRelaxer {
    private idealDistanceToCentroid: number;
    private nVerticies: number;
    private nFaces: number;
    private eps: number;
    private changeRate: number;

    constructor(
        private builder: MeshBuilder,
        { targetEdgeLength, eps = 1e-4, changeRate = 0.05 }: RelaxOptions,
    ) {
        const size = builder.size();
        this.nFaces = size.faces;
        this.nVerticies = size.verticies;
        this.idealDistanceToCentroid = ((targetEdgeLength * Math.sqrt(3)) / 3) * 0.9;

        this.eps = eps;
        this.changeRate = changeRate;
    }

    pass(_: number): number {
        const centroids = new Array<RawVertex>(this.nFaces).fill(utils.ZERO);
        for (let fi = 0; fi < this.nFaces; fi++) {
            const [a, b, c] = this.builder.face(fi).map((vi) => this.builder.coords(vi));
            centroids[fi] = calculateFaceCentroid(a, b, c);
        }

        const forcesByVertex = new Array<RawVertex>(this.nVerticies).fill(utils.ZERO);
        for (let fi = 0; fi < this.nVerticies; fi++) {
            const face = this.builder.face(fi);
            const centroid = centroids[fi];
            for (const vi of face) {
                const v = this.builder.coords(vi);
                const toCentroid = utils.diff(centroid, v);
                const lenghtsDelta = utils.size(toCentroid) - this.idealDistanceToCentroid;

                if (Math.abs(lenghtsDelta) < this.eps) {
                    continue;
                }

                const force = utils.mul(toCentroid, lenghtsDelta);
                forcesByVertex[vi] = utils.sum(forcesByVertex[vi], force);
            }
        }

        let maxChangeDoneSquared = 0;
        for (let vi = 0; vi < this.nVerticies; vi++) {
            const totalForce = forcesByVertex[vi];

            if (totalForce[0] === 0 && totalForce[1] === 0 && totalForce[2] === 0) {
                continue;
            }

            const vertex = this.builder.coords(vi);
            this.builder.setCoords(vi, utils.normz(utils.sum(vertex, utils.mul(totalForce, this.changeRate))));

            const changeDoneSquared = utils.sizeSquared(totalForce) * this.changeRate;

            if (maxChangeDoneSquared < changeDoneSquared) {
                maxChangeDoneSquared = changeDoneSquared;
            }
        }

        return maxChangeDoneSquared;
    }
}

function calculateFaceCentroid(pa: RawVertex, pb: RawVertex, pc: RawVertex) {
    const vabHalf = utils.mul(utils.diff(pb, pa), 0.5);
    const pabHalf = utils.sum(pa, vabHalf); // pa.clone().add(vabHalf);
    return utils.sum(utils.mul(utils.diff(pc, pabHalf), 1 / 3), pabHalf);
}

function withRandomShift(seq: RandomSequence, scale: number, input: RawVertex): RawVertex {
    return [input[0] + scale * (2 * seq() - 1), input[1] + scale * (2 * seq() - 1), input[2] + scale * (2 * seq() - 1)];
}
