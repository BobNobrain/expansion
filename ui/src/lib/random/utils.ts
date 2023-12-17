import { type RandomSequence } from './types';

export function pick<T>(seq: RandomSequence, vals: T[]): T {
    return vals[Math.floor(seq() * vals.length)];
}

export function drawInteger(seq: RandomSequence, limits: { min: number; max: number }): number {
    return Math.floor(seq() * (limits.max - limits.min) + limits.min);
}
