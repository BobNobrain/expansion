import { NBSP } from '../strings';

export type CreateDurationOptions<K extends string> = {
    keys: K[];
    scales: number[];
};

export type DurationType<K extends string> = {
    [period in K]?: number;
};
export type NormalizedDurationType<K extends string> = {
    [period in K]: number;
};

export type DurationScale<K extends string> = {
    zero: DurationType<K>;
    normalize: (input: Readonly<DurationType<K>>) => NormalizedDurationType<K>;
    valueOf: (input: Readonly<DurationType<K>>) => number;
    toString: (input: Readonly<DurationType<K>>) => string;
    mul: (input: Readonly<DurationType<K>>, factor: number) => DurationType<K>;
};

export function createDurationScale<K extends string>({ keys, scales }: CreateDurationOptions<K>): DurationScale<K> {
    if (keys.length !== scales.length) {
        throw new Error('scales and keys must have the exact same number of elements');
    }

    const N = keys.length;
    const zero: DurationType<K> = {};

    const normalize = (input: Readonly<DurationType<K>>): NormalizedDurationType<K> => {
        const result = {} as NormalizedDurationType<K>;

        for (let i = 1; i < N; i++) {
            const prevKey = keys[i - 1];
            const currKey = keys[i];

            let prev = input[prevKey] ?? 0;
            let curr = input[currKey] ?? 0;
            const limit = scales[i];

            if (prev >= limit) {
                curr += Math.floor(prev / limit);
                prev %= limit;
            }

            result[prevKey] = prev;
            result[currKey] = curr;
        }

        return result;
    };

    const valueOf = (d: DurationType<K>): number => {
        let total = 0;
        let multiplier = 1;

        for (let i = 0; i < N; i++) {
            multiplier *= scales[i];
            total += (d[keys[i]] ?? 0) * multiplier;
        }

        return total;
    };

    const toString = (d: DurationType<K>): string => {
        const normalized = normalize(d);
        const parts: string[] = [];

        for (let i = 0; i < N; i++) {
            const n = normalized[keys[i]];
            if (n === 0) {
                continue;
            }

            const suffix = keys[i];
            parts.push([n.toFixed(0), suffix].join(NBSP));
        }

        parts.reverse();
        return parts.join(' ');
    };

    const mul = (input: Readonly<DurationType<K>>, factor: number): DurationType<K> => {
        const result: DurationType<K> = {};

        for (let i = 0; i < N; i++) {
            const key = keys[i];
            const n = input[key];

            if (n === undefined) {
                continue;
            }

            result[key] = n * factor;
        }

        return result;
    };

    return { zero, normalize, valueOf, toString, mul };
}
