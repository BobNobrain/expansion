import { formatRelative } from 'date-fns';
import { formatScalar } from '../strings';
import { createDurationScale } from './duration';

const singleFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
});

export function renderRealTimeRelative(target: Date, now: Date): string {
    return formatRelative(target, now);
}

export function renderRealTime(real: Date): string {
    return singleFormatter.format(real);
}

const realTimeDurationScale = createDurationScale({
    keys: ['ms', 's', 'm', 'h', 'd'],
    scales: [1, 1000, 60, 60, 24],
});

export type Duration = typeof realTimeDurationScale.zero;

const DURATION_SCALES = [1, 1000, 60, 60, 24];
const DURATION_KEYS: Array<keyof Duration> = ['ms', 's', 'm', 'h', 'd'];
const DURATION_N = 5;

export namespace Duration {
    export const normalize = realTimeDurationScale.normalize;
    export const toMs = realTimeDurationScale.valueOf;
    export const toString = realTimeDurationScale.toString;
    export const mul = realTimeDurationScale.mul;
}

export type RenderSpeedOptions = {
    unit?: string;
    noTimeUnit?: boolean;
    minTimeUnit?: keyof Duration;
};

export function renderConstantSpeed(
    delta: number,
    timeDelta: Duration,
    { unit = '', noTimeUnit, minTimeUnit }: RenderSpeedOptions = {},
): string {
    if (delta === 0) {
        return '--';
    }

    let deltaPerCurrent = delta / Duration.toMs(timeDelta);
    const minIndex = minTimeUnit === undefined ? 0 : DURATION_KEYS.indexOf(minTimeUnit);

    for (let i = 0; i < DURATION_N; i++) {
        deltaPerCurrent *= DURATION_SCALES[i];

        if (i < minIndex || Math.abs(deltaPerCurrent) <= 0.1) {
            continue;
        }

        const timeUnit = noTimeUnit ? unit : `${unit}/${DURATION_KEYS[i]}`;
        return formatScalar(deltaPerCurrent, { digits: 1, unit: timeUnit, explicitPlusSign: true });
    }

    const timeUnit = noTimeUnit ? unit : `${unit}/${DURATION_KEYS[DURATION_N - 1]}`;
    return formatScalar(deltaPerCurrent, { digits: 1, unit: timeUnit, explicitPlusSign: true });
}
