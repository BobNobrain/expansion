import { type RGBColor } from '../lib/color';

export type CelestialSurface = {
    grid: CelestialSurfaceGrid;
    colors: RGBColor[];
};

export type CelestialSurfaceGrid = {
    coords: number[];
    edges: number[][];
};
