export type Angle = number & { __unit?: 'rad' };

export namespace Angle {
    export const FULL_CIRCLE: Angle = Math.PI * 2;

    export function fullCircles(circles: number): Angle {
        return FULL_CIRCLE * circles;
    }

    export function* iterateFullCircle(step: Angle, opts: { inclusive?: boolean } = {}) {
        for (let th = 0; th < FULL_CIRCLE; th += step) {
            yield th;
        }
        if (opts.inclusive) {
            yield FULL_CIRCLE;
        }
    }
}
