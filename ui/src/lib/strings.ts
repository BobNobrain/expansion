export type FormatScalarOptions = {
    /** How many digits after decimal separator */
    digits?: number;
    /** Optional unit of measurement */
    unit?: string;
    /** If disable shortening 5000 -> 5K, etc. */
    noShortenings?: boolean;
};

export function formatScalar(scalar: number, { digits = 3, unit, noShortenings }: FormatScalarOptions = {}): string {
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
        suffix += ' ' + unit;
    }

    const num = scalar.toFixed(digits);
    return num + suffix;
}
