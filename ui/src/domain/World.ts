import type { Predictable } from '@/lib/predictables';
import { type RGBColor } from '../lib/color';
import { type WorldParams, type WorldSurfaceConditions } from './WorldOverview';
import { type ExplorationData } from './misc';

export type World = {
    id: string;
    params: WorldParams;
    surface: WorldSurfaceConditions;

    explored: ExplorationData | null;

    grid: WorldGrid;
    elevationsScaleKm: number;
    colors: RGBColor[];
    elevations: number[];
    biomes: string[];
    soilFertilities?: number[];
    moistureLevels?: number[];

    resources: Record<number, ResourceDeposit[]>;

    oceanLevel: number;
    oceans: Record<string, number>;
    atmosphere: Record<string, number>;
    snow: Record<string, number>;

    population: Predictable;
    tileCityCenterIDs: Record<string, number>;
    tileBaseIDs: Record<string, number>;
};

export enum WorldTileOccupation {
    Free = 'free',
    City = 'city',
    Base = 'base',
    Infra = 'infra',
    Unknown = 'unknown',
}

export type WorldGrid = {
    coords: number[];
    edges: number[][];
};

export type ResourceDeposit = {
    resource: string;
    abundance: number;
};

export namespace World {
    export function parseTileId(id: string): number | undefined {
        const n = Number.parseInt(id, 16);
        if (Number.isNaN(n)) {
            return undefined;
        }
        return n;
    }

    export function makeTileId(tileNumber: number): string {
        return tileNumber.toString(16).padStart(3, '0');
    }

    export function getTileCoords(grid: WorldGrid, tileIndex: number): [number, number, number] {
        return grid.coords.slice(tileIndex * 3, tileIndex * 3 + 3) as [number, number, number];
    }
}

export type WorldTileConditions = {
    soilFertility: number;
    resources: ResourceDeposit[];
    oceanResources: ResourceDeposit[];
    atmosphericResources: ResourceDeposit[];
};
