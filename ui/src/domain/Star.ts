export type Star = Readonly<{
    id: string;
    luminositySuns: number;
    massSuns: number;
    tempK: number;
    radiusAu: number;
    ageBillionYears: number;
}>;

export namespace Star {
    export function getColor(star: Star): string {
        const temp = star.tempK / 100;
        let red = 0,
            green = 0,
            blue = 0;

        if (temp <= 66) {
            red = 255;

            green = temp;
            green = 99.4708025861 * Math.log(green) - 161.1195681661;

            if (temp <= 19) {
                blue = 0;
            } else {
                blue = temp - 10;
                blue = 138.5177312231 * Math.log(blue) - 305.0447927307;
            }
        } else {
            red = temp - 60;
            red = 329.698727446 * Math.pow(red, -0.1332047592);

            green = temp - 60;
            green = 288.1221695283 * Math.pow(green, -0.0755148492);

            blue = 255;
        }

        return (
            '#' +
            [red, green, blue]
                .map((c) => Math.max(0, Math.min(c, 255)))
                .map((i) => i.toString(16))
                .join('')
        );
    }

    export function getSpectralClass(star: Star): string {
        const k = star.tempK;
        if (k >= 30_000) {
            return 'O';
        }
        if (k >= 10_000) {
            return 'B';
        }
        if (k >= 7500) {
            return 'A';
        }
        if (k >= 6000) {
            return 'F';
        }
        if (k >= 5200) {
            return 'G';
        }
        if (k >= 3700) {
            return 'K';
        }
        return 'M';
    }
}
