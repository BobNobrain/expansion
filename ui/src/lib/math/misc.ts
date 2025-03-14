export function lerp(from: number, to: number, amount: number): number {
    return from + (to - from) * amount;
}

export type RemapOptions = {
    from: [number, number];
    to: [number, number];
};

export function remap(value: number, { from, to }: RemapOptions): number {
    const unit = (value - from[0]) / (from[1] - from[0]);
    return to[0] + (to[1] - to[0]) * unit;
}
