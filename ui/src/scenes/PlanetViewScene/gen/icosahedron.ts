import { MeshBuilder } from '../../../lib/3d/MeshBuilder';
import { type RawVertex, type Poly } from '../../../lib/3d/types';
import * as utils from './utils';

type GenerateOptions = {
    size?: number;
    subdivisions?: number;
};

export function icosahedron({ size = 1, subdivisions = 1 }: GenerateOptions) {
    const phi = (1.0 + Math.sqrt(5.0)) / 2.0;
    const du = size / Math.sqrt(phi * phi + 1.0);
    const dv = phi * du;

    const builder = new MeshBuilder();
    builder.addMany([
        [0, +dv, +du],
        [0, +dv, -du],
        [0, -dv, +du],
        [0, -dv, -du],
        [+du, 0, +dv],
        [-du, 0, +dv],
        [+du, 0, -dv],
        [-du, 0, -dv],
        [+dv, +du, 0],
        [+dv, -du, 0],
        [-dv, +du, 0],
        [-dv, -du, 0],
    ]);

    builder.assembleVerticies([8, 1, 0]);
    builder.assembleVerticies([5, 4, 0]);
    builder.assembleVerticies([10, 5, 0]);
    builder.assembleVerticies([4, 8, 0]);
    builder.assembleVerticies([1, 10, 0]);
    builder.assembleVerticies([8, 6, 1]);
    builder.assembleVerticies([6, 7, 1]);
    builder.assembleVerticies([7, 10, 1]);
    builder.assembleVerticies([11, 3, 2]);
    builder.assembleVerticies([9, 4, 2]);
    builder.assembleVerticies([4, 5, 2]);
    builder.assembleVerticies([3, 9, 2]);
    builder.assembleVerticies([5, 11, 2]);
    builder.assembleVerticies([7, 6, 3]);
    builder.assembleVerticies([11, 7, 3]);
    builder.assembleVerticies([6, 9, 3]);
    builder.assembleVerticies([9, 8, 4]);
    builder.assembleVerticies([10, 11, 5]);
    builder.assembleVerticies([8, 9, 6]);
    builder.assembleVerticies([11, 10, 7]);

    builder.subdivide(subdivideTriangleN(subdivisions));

    builder.mapVerticies(utils.normz);
    builder.mapVerticies(utils.scale(size));

    return builder;
}

const subdivideTriangleN =
    (n: number) =>
    (triangle: Poly, builder: MeshBuilder): Poly[] => {
        const createVertex = (coords: RawVertex) => builder.addIfNotClose(...coords);
        const [main, sideAEnd, sideBEnd] = triangle.map((vi) => builder.coords(vi));
        const sideACoords = interpolate(main, sideAEnd, n);
        const sideBCoords = interpolate(main, sideBEnd, n);

        const lines = new Array<number[]>(n);
        lines[0] = [triangle[0]];

        for (let l = 1; l < n; l++) {
            const lineCoords = interpolate(sideACoords[l], sideBCoords[l], l + 1);
            const line = lineCoords.map(createVertex);
            lines[l] = line;
        }

        const miniTriangles: Poly[] = [];

        for (let l = 1; l < n; l++) {
            const prevLine = lines[l - 1];
            const line = lines[l];
            for (let i = 1; i < l + 1; i++) {
                miniTriangles.push([prevLine[i - 1], line[i - 1], line[i]]);
            }

            for (let i = 1; i < l; i++) {
                miniTriangles.push([prevLine[i], prevLine[i - 1], line[i]]);
            }
        }

        return miniTriangles;
    };

function interpolate(start: RawVertex, end: RawVertex, n: number): RawVertex[] {
    if (n <= 2) {
        return [start, end];
    }

    const step = utils.mul(utils.diff(end, start), 1 / (n - 1));
    const result = new Array<RawVertex>(n);
    result[0] = start;
    result[n - 1] = end;
    for (let i = 1; i < n - 1; i++) {
        result[i] = utils.sum(result[i - 1], step);
    }
    return result;
}
