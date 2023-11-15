export type NumericLimits = undefined | number | { min?: number; max?: number };

export namespace NumericLimits {
    export function isInside(value: number, limits: NumericLimits): boolean {
        if (limits === undefined) {
            return true;
        }

        if (typeof limits === 'number') {
            return value === limits;
        }

        return (limits.min === undefined || limits.min <= value) && (limits.max === undefined || value <= limits.max);
    }

    export function clamp(value: number, limits: NumericLimits): number {
        if (limits === undefined) {
            return value;
        }

        if (typeof limits === 'number') {
            return limits;
        }

        return Math.max(limits.min ?? -Infinity, Math.min(value, limits.max ?? Infinity));
    }

    export function intersect(l1: NumericLimits, l2: NumericLimits): NumericLimits {
        if (typeof l1 === 'number' || l2 === undefined) {
            return l1;
        }
        if (l1 === undefined || typeof l2 === 'number') {
            return l2;
        }

        const min1 = l1.min ?? -Infinity;
        const min2 = l2.min ?? -Infinity;
        const max1 = l1.max ?? Infinity;
        const max2 = l2.max ?? Infinity;

        if (max1 < min2) {
            return max1;
        }
        if (max2 < min1) {
            return min1;
        }

        const min = Math.max(min1, min2);
        const max = Math.min(max1, max2);
        return {
            min: min === -Infinity ? undefined : min,
            max: max === Infinity ? undefined : max,
        };
    }

    export function pickAPoint(l: NumericLimits): number | undefined {
        if (typeof l === 'object') {
            if (l.max === undefined) {
                return l.min;
            }
            if (l.min === undefined) {
                return l.max;
            }

            return l.min + (l.max - l.min) / 2;
        }

        return l;
    }

    export function eq(l1: NumericLimits, l2: NumericLimits): boolean {
        if (l1 === l2) {
            return true;
        }
        if (typeof l1 === 'object' && typeof l2 === 'object') {
            return l1.min === l2.min && l1.max === l2.max;
        }
        return false;
    }
}
