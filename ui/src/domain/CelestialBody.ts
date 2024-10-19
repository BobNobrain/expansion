export type CelestialBodyClass = 'terrestial' | 'gaseous' | 'unknown';

export namespace CelestialBodyClass {
    export function fromString(str: string): CelestialBodyClass {
        switch (str) {
            case 'terrestial':
            case 'gaseous':
                return str;

            default:
                return 'unknown';
        }
    }
}

export type CelestialBody = {
    id: string;
    radiusKm: number;
    ageByrs: number;
    class: CelestialBodyClass;
    isExplored: boolean;
    size: number;

    surface: {
        tempK: number;
        pressureBar: number;
        g: number;
    };
};
