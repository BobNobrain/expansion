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
