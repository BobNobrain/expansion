export type FormatScalarOptions = {
    /** How many digits after decimal separator */
    digits?: number;
    /** Optional unit of measurement */
    unit?: string;
    /** If disable shortening 5000 -> 5K, etc. */
    noShortenings?: boolean;
    /** If positive numbers should be rendered with an explicit '+' sign in front */
    explicitPlusSign?: boolean;
};

export function formatScalar(
    scalar: number,
    { digits = 3, unit, noShortenings, explicitPlusSign }: FormatScalarOptions = {},
): string {
    let suffix = '';
    if (!noShortenings) {
        const abs = Math.abs(scalar);
        if (abs > 1e9) {
            suffix = 'B';
            scalar /= 1e9;
        } else if (abs > 1e6) {
            suffix = 'M';
            scalar /= 1e6;
        } else if (abs > 1e3) {
            suffix = 'K';
            scalar /= 1e3;
        }
    }

    if (unit) {
        // nbsp
        suffix += ' ' + unit;
    }

    const prefix = explicitPlusSign && scalar > 0 ? '+' : '';

    const num = scalar.toFixed(digits);
    return prefix + num + suffix;
}

export function formatDegreesCelsius(temp: number, options: { unit?: 'K' | 'C' } = {}): string {
    if (options.unit === 'K') {
        temp -= 273.15;
    }
    return formatScalar(temp, { digits: 0, unit: '°C', noShortenings: true });
}

export type FormatIntegerOptions = {
    /** How many digits after decimal separator when integer is shortened */
    digits?: number;
};

export function formatInteger(integer: number, { digits = 1 }: FormatIntegerOptions = {}): string {
    let suffix = '';
    const abs = Math.abs(integer);
    if (abs > 1e9) {
        suffix = 'B';
        integer /= 1e9;
    } else if (abs > 1e6) {
        suffix = 'M';
        integer /= 1e6;
    } else if (abs > 1e3) {
        suffix = 'K';
        integer /= 1e3;
    }
    if (!suffix) {
        return integer.toFixed(0);
    }

    return integer.toFixed(digits) + suffix;
}
