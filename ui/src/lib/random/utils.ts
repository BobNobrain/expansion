import { type RandomSequence } from './types';

export function pick<T>(seq: RandomSequence, vals: T[]): T {
    return vals[Math.floor(seq() * vals.length)];
}

export function drawInteger(seq: RandomSequence, limits: { min: number; max: number }): number {
    return Math.floor(seq() * (limits.max - limits.min)) + limits.min;
}

export function drawDistinctIntegers(
    seq: RandomSequence,
    n: number,
    limits: { min: number; max: number },
): Set<number> {
    const met = new Set<number>();
    for (let i = 0; i < n; i++) {
        const next = drawInteger(seq, { min: limits.min, max: limits.max - n + i });

        if (met.has(next)) {
            met.add(limits.max - n + i);
        } else {
            met.add(next);
        }
    }

    return met;
}
