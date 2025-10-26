import { type World } from '@/domain/World';
import { type MaterialData } from '@/lib/3d/material';
import type { RawColor } from '@/lib/3d/types';
import { Color } from '@/lib/color';
import { remap } from '@/lib/math/misc';
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

const fertilityRenderer = createPaletteRenderer(
    [[0.4, 0.4, 0.4], ...Color.createPalette(9, [0.9, 0.2, 0.2], [0.5, 1.0, 0.3])],
    (world) =>
        world.soilFertilities
            ? world.soilFertilities.map((f) => (f < 0 ? 0 : remap(f, { from: [0, 1], to: [0.1, 1] })))
            : [],
);

const moistureRenderer = createPaletteRenderer(
    Color.createPalette(10, [0.7, 0.3, 0.2], [0.1, 0.8, 1.0]),
    (world) => world.moistureLevels ?? [],
);

const resourceEmptyColor: RawColor = [0.4, 0.4, 0.4];
const resourceAbundanceColors: RawColor[] = [
    [0.9, 0.2, 0.2],
    [0.8, 0.5, 0.2],
    [0.7, 0.7, 0.2],
    [0.5, 0.8, 0.2],
    [0.2, 0.9, 0.2],
];
const resourcesRenderer: ColorRenderer = (world) =>
    world.elevations.map((_, i) => {
        const resources = world.resources[i];
        if (!resources || !resources.length) {
            return { reflective: resourceEmptyColor };
        }
        const maxAbundance = Math.max(...resources.map((r) => r.abundance));
        const colorIndex = Math.min(
            resourceAbundanceColors.length - 1,
            Math.floor(maxAbundance * resourceAbundanceColors.length),
        );
        return { reflective: resourceAbundanceColors[colorIndex] };
    });

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

        case 'resources':
            return resourcesRenderer;

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
