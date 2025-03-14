import { type World } from '../../domain/World';
import { type MaterialData } from '../../lib/3d/material';
import type { RawColor } from '../../lib/3d/types';
import { Color } from '../../lib/color';
import { type RenderMode } from './settings';

export type ColorRenderer = (surface: World) => MaterialData[];

const naturalColorRenderer: ColorRenderer = (surface) =>
    surface.colors.map((color, i) => {
        let roughness = 1.0;
        switch (surface.biomes[i]) {
            case 'ocean':
                roughness = 0.2;
                break;

            case 'solid':
                roughness = 0.9;
                break;
        }

        return { reflective: Color.toRaw(color), roughness };
    });

const colorsByBiome: Record<string, RawColor> = {
    none: [1, 0, 1],
    solid: [0.5, 0.5, 0.5],
    liquid: [0, 0.5, 1],
    regolith: [0.8, 0.8, 0.1],
    soil: [0.1, 0.1, 0.1],
    ice: [0.5, 0.8, 1],
    snow: [0.8, 0.8, 0.9],
};
const biomesRenderer: ColorRenderer = (surface) => {
    return surface.biomes.map((biome) => ({ reflective: colorsByBiome[biome] ?? colorsByBiome.none }));
};

const elevationColors: RawColor[] = [
    [0, 0, 0.5],
    [0, 0, 1],
    [0, 0.5, 1],
    [0.5, 0.8, 1],
    [1, 1, 1],
    [1, 1, 0.5],
    [1, 1, 0],
    [1, 0.5, 0],
    [1, 0, 0],
    [0.5, 0, 0],
];

const elevationsRenderer = createPaletteRenderer(elevationColors, (world) => {
    const min = Math.min(...world.elevations);
    const max = Math.max(...world.elevations);
    const diff = max - min;

    return world.elevations.map((h) => (h - min) / diff);
});

const fertilityRenderer = createPaletteRenderer(Color.createPalette(10, [0.2, 0.2, 0.2], [0.5, 1.0, 0.3]), (world) =>
    world.soilFertilities ? world.soilFertilities.map((f) => Math.max(0, f)) : [],
);

const moistureRenderer = createPaletteRenderer(
    Color.createPalette(10, [0.7, 0.3, 0.2], [0.1, 0.8, 1.0]),
    (world) => world.moistureLevels ?? [],
);

export function pickRenderer(mode: RenderMode): ColorRenderer {
    switch (mode) {
        case 'biomes':
            return biomesRenderer;

        case 'elevations':
            return elevationsRenderer;

        case 'soil':
            return fertilityRenderer;

        case 'moisture':
            return moistureRenderer;

        default:
            return naturalColorRenderer;
    }
}

function createPaletteRenderer(palette: RawColor[], getter: (w: World) => number[]): ColorRenderer {
    return (world) =>
        getter(world).map((unit) => ({
            reflective: palette[Math.min(palette.length - 1, Math.floor(unit * palette.length))],
        }));
}
