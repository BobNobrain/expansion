import { type RGBColor } from '../lib/color';

export type CelestialSurface = {
    grid: CelestialSurfaceGrid;
    colors: RGBColor[];
    elevations: number[];
    biomes: string[];

    oceanLevel: number;
    oceans: Record<string, number>;
    atmosphere: Record<string, number>;
};

export type CelestialSurfaceGrid = {
    coords: number[];
    edges: number[][];
};

export namespace CelestialSurface {
    export function parsePlotId(id: string): number | undefined {
        const n = Number.parseInt(id, 16);
        if (Number.isNaN(n)) {
            return undefined;
        }
        return n;
    }

    export function makePlotId(tileNumber: number): string {
        return tileNumber.toString(16).padStart(3, '0');
    }
}
