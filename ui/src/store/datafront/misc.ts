import { createDatafrontCleaner } from '@/lib/datafront/cleaner';
import { createDatafrontUpdater } from '@/lib/datafront/updater';
import type { Predictable as ApiPredictable } from '@/lib/net/types.generated';
import { ws } from '@/lib/net/ws';
import {
    LimitedPredictableMode,
    type Predictable,
    createConstantPredictable,
    createLimitedPredictable,
    createLinearPredictable,
} from '@/lib/predictables';

export const updater = createDatafrontUpdater(ws);
export const cleaner = createDatafrontCleaner(60_000);

export function parsePredictable({ b, c, l }: ApiPredictable): Predictable {
    if (c) {
        return createConstantPredictable(c.x);
    }

    if (l) {
        return createLinearPredictable({ x0: l.x, t0: new Date(l.t), deltaX: l.v, deltaT: 1 });
    }

    if (b) {
        let mode = LimitedPredictableMode.Max;
        switch (b.mode) {
            case 'max':
                mode = LimitedPredictableMode.Max;
                break;
            case 'min':
                mode = LimitedPredictableMode.Min;
                break;
        }

        return createLimitedPredictable(parsePredictable(b.inner), b.x, mode);
    }

    throw new Error('could not parse predictable');
}
