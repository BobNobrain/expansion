export type Predictable = {
    predict: (at: Date) => number;
};

export type LinearPredictableOptions = {
    x0: number;
    t0: Date;
    deltaX: number;
    /** In milliseconds */
    deltaT: number;
};

export function createLinearPredictable(opts: LinearPredictableOptions): Predictable {
    const speed = opts.deltaX / opts.deltaT;
    const x0 = opts.x0;
    const t0 = opts.t0.getTime();

    return {
        predict: (at) => x0 + speed * (at.getTime() - t0),
    };
}

export function createConstantPredictable(value: number): Predictable {
    return { predict: () => value };
}
