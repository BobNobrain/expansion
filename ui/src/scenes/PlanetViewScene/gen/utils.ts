import { type RawVertex } from '../../../lib/3d/types';

export function calcCenter(vs: RawVertex[]): RawVertex {
    let x = 0;
    let y = 0;
    let z = 0;
    for (const v of vs) {
        x += v[0];
        y += v[1];
        z += v[2];
    }
    return [x / vs.length, y / vs.length, z / vs.length];
}

export function normz(v: RawVertex): RawVertex {
    const [x, y, z] = v;
    const d = Math.sqrt(x * x + y * y + z * z);
    return [x / d, y / d, z / d];
}

export function scale(size: number): (v: RawVertex) => RawVertex {
    return ([x, y, z]) => [x * size, y * size, z * size];
}

export function sizeSquared(v: RawVertex): number {
    return v[0] * v[0] + v[1] * v[1] + v[2] * v[2];
}
export function size(v: RawVertex): number {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

export function sum(...vs: RawVertex[]): RawVertex {
    const sum: [number, number, number] = [0, 0, 0];
    for (const v of vs) {
        sum[0] += v[0];
        sum[1] += v[1];
        sum[2] += v[2];
    }
    return sum;
}
export function diff(v1: RawVertex, v2: RawVertex): RawVertex {
    return [v1[0] - v2[0], v1[1] - v2[1], v1[2] - v2[2]];
}

export function mul(v: RawVertex, m: number): RawVertex {
    return [v[0] * m, v[1] * m, v[2] * m];
}

export const ZERO: RawVertex = [0, 0, 0];

export function dot(v1: RawVertex, v2: RawVertex): number {
    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
}

export function cross(a: RawVertex, b: RawVertex): RawVertex {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
}
