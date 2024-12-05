import { type CelestialSurface } from '../../domain/CelstialSurface';
import { type RGBColor } from '../../lib/color';

export type TileRenderMode = 'natural' | 'biomes' | 'population' | 'elevations' | 'temp' | 'infra' | 'resources';
export type ColorRenderer = (surface: CelestialSurface) => RGBColor[];

const naturalColorRenderer: ColorRenderer = (surface) => surface.colors;

const colorsByBiome: Record<string, RGBColor> = {
    none: { r: 1, g: 0, b: 1 },
    solid: { r: 0.5, g: 0.5, b: 0.5 },
    liquid: { r: 0, g: 0.5, b: 1 },
    regolith: { r: 0.8, g: 0.8, b: 0.1 },
    soil: { r: 0.1, g: 0.1, b: 0.1 },
    ice: { r: 0.5, g: 0.8, b: 1 },
    snow: { r: 0.8, g: 0.8, b: 0.9 },
};
const biomesRenderer: ColorRenderer = (surface) => {
    return surface.biomes.map((biome) => colorsByBiome[biome] ?? colorsByBiome.none);
};

const elevationColors: RGBColor[] = [
    { r: 0, g: 0, b: 0.5 },
    { r: 0, g: 0, b: 1 },
    { r: 0, g: 0.5, b: 1 },
    { r: 0.5, g: 0.8, b: 1 },
    { r: 1, g: 1, b: 1 },
    { r: 1, g: 1, b: 0.5 },
    { r: 1, g: 1, b: 0 },
    { r: 1, g: 0.5, b: 0 },
    { r: 1, g: 0, b: 0 },
    { r: 0.5, g: 0, b: 0 },
];
const elevationsRenderer: ColorRenderer = (surface) => {
    const min = Math.min(...surface.elevations);
    const max = Math.max(...surface.elevations);
    const nColors = elevationColors.length;

    return surface.elevations.map((h) => {
        const scaled = (h - min) / (max - min);
        const index = Math.min(Math.floor(nColors * scaled), nColors - 1);
        console.log({ scaled, index, c: elevationColors[index] });
        return elevationColors[index];
    });
};

export function pickRenderer(mode: TileRenderMode): ColorRenderer {
    switch (mode) {
        case 'biomes':
            return biomesRenderer;

        case 'elevations':
            return elevationsRenderer;

        default:
            return naturalColorRenderer;
    }
}
