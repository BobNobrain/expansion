import { createDurationScale } from '@/lib/time/duration';
import { formatScalar } from '../lib/strings';

// TODO: fetch these from the server
const GAME_TIME_ORIGIN = new Date('2025-01-01T00:00:00Z');
const GAME_TIME_YEAR_MS = 7 * 24 * 3600_000; // a week
export const GAME_TIME_DAY_MS = GAME_TIME_YEAR_MS / 365; // because screw leap days (for now)
const GAME_TIME_HOURS_MS = GAME_TIME_DAY_MS / 24;
const GAME_TIME_YEAR_START = 2200;

const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export type GameTime = {
    year: number;
    month: number;
    date: number;
    hours: number;
};

export namespace GameTime {
    export function fromReal(real: Date): GameTime {
        const msElapsed = real.getTime() - GAME_TIME_ORIGIN.getTime();
        const fullGameYears = Math.floor(msElapsed / GAME_TIME_YEAR_MS);

        let remainingDays = Math.floor((msElapsed - fullGameYears * GAME_TIME_YEAR_MS) / GAME_TIME_DAY_MS);
        const remainder = msElapsed - remainingDays * GAME_TIME_DAY_MS - fullGameYears * GAME_TIME_YEAR_MS;
        let month = 1;

        for (const monthLength of MONTH_LENGTHS) {
            if (remainingDays < monthLength) {
                break;
            }

            ++month;
            remainingDays -= monthLength;
        }

        const hours = Math.floor(remainder / GAME_TIME_HOURS_MS);

        return {
            year: fullGameYears + GAME_TIME_YEAR_START,
            month,
            date: remainingDays,
            hours,
        };
    }

    export type ToStringOptions = {
        withHours?: boolean;
    };

    export function toString({ year, month, date, hours }: GameTime, { withHours }: ToStringOptions = {}): string {
        const dateStr = [year, month.toString().padStart(2, '0'), date.toString().padStart(2, '0')].join('-');

        if (!withHours) {
            return dateStr;
        }

        return `${dateStr} ${hours.toString().padStart(2, '0')}:00`;
    }
}

export type RenderGameTimeSpeedOptions = {
    unit?: string;
    quantized?: boolean;
    noTimeUnit?: boolean;
};

export function renderGameTimeConstantSpeed(
    deltaPerDay: number,
    { unit = '', noTimeUnit }: RenderGameTimeSpeedOptions = {},
): string {
    if (deltaPerDay === 0) {
        return '--';
    }

    const digits = 1;

    if (Math.abs(deltaPerDay) >= 0.1) {
        return formatScalar(deltaPerDay, { digits, unit: noTimeUnit ? unit : unit + '/d', explicitPlusSign: true });
    }

    const deltaPerMonth = deltaPerDay * 30;
    if (Math.abs(deltaPerMonth) >= 0.1) {
        return formatScalar(deltaPerMonth, { digits, unit: noTimeUnit ? unit : unit + '/mo', explicitPlusSign: true });
    }

    const deltaPerYear = deltaPerDay * 365;
    return formatScalar(deltaPerYear, { digits, unit: noTimeUnit ? unit : unit + '/y', explicitPlusSign: true });
}

export function renderGameTimeRelative(target: Date, now: Date): string {
    const deltaMs = target.getTime() - now.getTime();
    if (deltaMs === 0) {
        return 'just now';
    }

    const deltaMsAbs = Math.abs(deltaMs);

    const deltaYears = Math.floor(deltaMsAbs / GAME_TIME_YEAR_MS);
    const deltaDays = Math.floor((deltaMsAbs - deltaYears * GAME_TIME_YEAR_MS) / GAME_TIME_DAY_MS);
    const parts: string[] = [];

    if (deltaMs > 0) {
        parts.push('in');
    }

    if (deltaYears !== 0) {
        parts.push(deltaYears + 'y');
    }
    if (deltaDays !== 0) {
        parts.push(deltaDays + 'd');
    }

    if (deltaDays === 0 && deltaYears === 0) {
        return 'just now';
    }

    if (deltaMs < 0) {
        parts.push('ago');
    }

    return parts.join(' ');
}

const gameTimeDurationScale = createDurationScale({
    keys: ['d', 'm', 'y'],
    scales: [1, 30, 12],
});

export type GameTimeDuration = typeof gameTimeDurationScale.zero;

export namespace GameTimeDuration {
    export const normalize = gameTimeDurationScale.normalize;
    export const toString = gameTimeDurationScale.toString;
    export const toDays = gameTimeDurationScale.valueOf;
    export const mul = gameTimeDurationScale.mul;
}
