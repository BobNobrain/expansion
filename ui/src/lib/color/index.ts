import type { RawColor } from '../3d/types';

export type RGBColor = {
    r: number;
    g: number;
    b: number;
    a?: number;
};

export type Color = string | RGBColor | RawColor;

export namespace Color {
    export function toRGB(c: Color): RGBColor {
        if (Array.isArray(c)) {
            return { r: c[0], g: c[1], b: c[2] };
        }
        if (typeof c === 'object') {
            return c;
        }

        if (c.startsWith('#') && (c.length === 7 || c.length === 9)) {
            const r = Number.parseInt(c.substring(1, 3), 16) / 255;
            const g = Number.parseInt(c.substring(3, 5), 16) / 255;
            const b = Number.parseInt(c.substring(5, 7), 16) / 255;
            if (c.length === 9) {
                const a = Number.parseInt(c.substring(7, 9), 16) / 255;
                return { r, g, b, a };
            }
            return { r, g, b };
        }

        throw new Error(`unsupported color format: '${c}'`);
    }

    export function toHexString(c: Color, opts: { stripAlpha?: boolean } = {}): string {
        if (typeof c === 'string') {
            if (!c.startsWith('#')) {
                throw new Error(`unsupported color format: '${c}'`);
            }
            return opts.stripAlpha ? c.substring(0, 7) : c;
        }

        let r = 0,
            g = 0,
            b = 0;
        let a: number | undefined;
        if (Array.isArray(c)) {
            [r, g, b] = c;
        } else if (typeof c === 'object') {
            r = c.r;
            g = c.g;
            b = c.b;
            a = c.a;
        }

        const components = [r, g, b];
        if (a !== undefined && !opts.stripAlpha) {
            components.push(a);
        }

        return (
            '#' +
            components
                .map((c) =>
                    Math.floor(c * 255)
                        .toString(16)
                        .padStart(2, '0'),
                )
                .join('')
        );
    }

    export function toRaw(c: Color): RawColor {
        const { r, g, b } = toRGB(c);
        return [r, g, b];
    }

    export function createPalette(size: number, from: RawColor, to: RawColor): RawColor[] {
        if (size <= 2) {
            return [from, to];
        }

        const result: RawColor[] = [];
        const step: RawColor = [
            (to[0] - from[0]) / (size - 1),
            (to[1] - from[1]) / (size - 1),
            (to[2] - from[2]) / (size - 1),
        ];

        result.push(from);
        for (let i = 1; i < size - 1; i++) {
            result.push([from[0] + step[0] * i, from[1] + step[1] * i, from[2] + step[2] * i]);
        }
        result.push(to);

        return result;
    }
}
