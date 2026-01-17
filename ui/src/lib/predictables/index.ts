import { Inventory } from '@/domain/Inventory';
import { Duration, renderConstantSpeed, type RenderSpeedOptions } from '@/lib/time';

export type Predictable = {
    predict: (at: Date | number) => number;
};

export type LinearPredictableOptions = {
    x0: number;
    t0: Date;
    deltaX: number;
    /** In milliseconds */
    deltaT: Duration;
};

export function createConstantPredictable(value: number): Predictable {
    return { predict: () => value };
}

export function createLinearPredictable(opts: LinearPredictableOptions): Predictable {
    const speed = opts.deltaX / Duration.toMs(opts.deltaT);
    const x0 = opts.x0;
    const t0 = opts.t0.getTime();

    return {
        predict: (at) => {
            const t = typeof at === 'number' ? at : at.getTime();
            return x0 + speed * (t - t0);
        },
    };
}

export enum LimitedPredictableMode {
    Before = 'before',
    After = 'after',
}

export function createLimitedPredictable(inner: Predictable, tLim: Date, mode: LimitedPredictableMode): Predictable {
    return {
        predict(at) {
            const tAt = typeof at === 'number' ? at : at.getTime();
            const isBefore = tAt < tLim.getTime();
            const isBeforeMode = mode === LimitedPredictableMode.Before;

            if (isBefore === isBeforeMode) {
                return inner.predict(tLim);
            }

            return inner.predict(at);
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

export function calcPredictableDelta(p: Predictable, at: Date, period: Duration): number {
    const x = p.predict(at);
    const xdx = p.predict(at.getTime() + Duration.toMs(period));
    return xdx - x;
}

export function calcPredictableStandartSpeed(p: Predictable, at: Date): number {
    return calcPredictableDelta(p, at, Inventory.STANDARD_TIME_DELTA);
}

export function renderPredictableSpeed(
    p: Predictable,
    at: Date,
    opts?: RenderSpeedOptions & { multiplier?: number },
): string {
    const timeDelta: Duration = { h: 1 };

    let xDelta = calcPredictableDelta(p, at, timeDelta);
    if (opts?.multiplier) {
        xDelta *= opts.multiplier;
    }

    return renderConstantSpeed(xDelta, timeDelta, opts);
}
