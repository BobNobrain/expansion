export type Predictable = {
    predict: (at: Date | number) => number;
};

export type LinearPredictableOptions = {
    x0: number;
    t0: Date;
    deltaX: number;
    /** In milliseconds */
    deltaT: number;
};

export function createConstantPredictable(value: number): Predictable {
    return { predict: () => value };
}

export function createLinearPredictable(opts: LinearPredictableOptions): Predictable {
    const speed = opts.deltaX / opts.deltaT;
    const x0 = opts.x0;
    const t0 = opts.t0.getTime();

    return {
        predict: (at) => {
            const t = typeof at === 'number' ? at : at.getTime();
            return x0 + speed * (t - t0);
        },
    };
}

export function sumPredictables(ps: Predictable[]): Predictable {
    return {
        predict: (at) => {
            let result = 0;
            for (const p of ps) {
                result += p.predict(at);
            }
            return result;
        },
    };
}

export function calcPredictableDelta(p: Predictable, at: Date, period: number): number {
    const x = p.predict(at);
    const xdx = p.predict(at.getTime() + period);
    return xdx - x;
}
