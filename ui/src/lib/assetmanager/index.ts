import type buildingsRawAsset from '@/../assets/buildings.generated.json';
import type commoditiesRawAsset from '@/../assets/commodities.generated.json';
import type recipesRawAsset from '@/../assets/recipes.generated.json';
import type { Building, Equipment } from '@/domain/Base';
import type { CommodityData } from '@/domain/Commodity';
import type { Recipe } from '@/domain/Recipe';
import { mapValues } from '../misc';
import { type Asset, createJSONAsset } from './asset';
import { GAME_TIME_DAY_MS } from '@/domain/GameTime';
import { Inventory } from '@/domain/Inventory';

export { Asset };
// TODO: generate proper typings from json schema

type CommoditiesRawAsset = typeof commoditiesRawAsset;
export type CommoditiesAsset = Record<string, CommodityData>;

export const commoditiesAsset = createJSONAsset({
    url: '/assets/commodities.generated.json',
    map: (raw: CommoditiesRawAsset): CommoditiesAsset => {
        return mapValues(raw.commodities, (data, id) => {
            return {
                id,
                category: data.category,
                mass: data.mass,
                volume: data.volume,
                size: { mass: data.mass, volume: data.volume },
                quantized: (data as { quantized?: boolean }).quantized ?? false,
            };
        });
    },
});

type BuildingsRawAsset = typeof buildingsRawAsset;
type BuildingsRawAssetEquipment = BuildingsRawAsset['equipment'];
type EquipmentId = keyof BuildingsRawAssetEquipment;
export type BuildingsAsset = {
    buildings: Record<string, Building>;
    equipment: Record<string, Equipment>;
};

export const buildingsAsset = createJSONAsset({
    url: '/assets/buildings.generated.json',
    map: (raw: BuildingsRawAsset): BuildingsAsset => {
        return {
            buildings: mapValues(raw.buildings, (data, id) => {
                return {
                    id,
                    matsPerArea: data.materialsPerArea,
                };
            }),
            equipment: mapValues<EquipmentId, BuildingsRawAssetEquipment[EquipmentId], Equipment>(
                raw.equipment,
                (data, id) => {
                    return {
                        id,
                        area: data.area,
                        building: data.building,
                        workforce: data.operators,
                        constructedFrom: data.constructedFrom,
                        requiresSoil: (data as { requiresSoil?: boolean }).requiresSoil,
                        requiresMinerals: (data as { requiresMinerals?: boolean }).requiresMinerals,
                        requiresLiquids: (data as { requiresLiquids?: boolean }).requiresLiquids,
                        requiresGases: (data as { requiresGases?: boolean }).requiresGases,
                    };
                },
            ),
        };
    },
});

export type RecipesAsset = { recipes: Recipe[] };

export const recipesAsset = createJSONAsset({
    url: '/assets/recipes.generated.json',
    map: (raw: typeof recipesRawAsset): RecipesAsset => {
        const lengths: Record<string, number | undefined> = { s: 1, m: 60, h: 60 * 60, d: 60 * 60 * 24 };
        const gameTimeDaySeconds = GAME_TIME_DAY_MS / 1000;

        return {
            recipes: raw.recipes.map((data, index) => {
                const baseTimeSeconds = Array.from(data.baseTime.matchAll(/(\d+)(\w)/g) ?? [])
                    .map(([_, n, s]) => (lengths[s] ?? 0) * Number.parseInt(n))
                    .reduce((acc, next) => acc + next, 0);

                const scaleFactor = gameTimeDaySeconds / baseTimeSeconds;

                return {
                    id: index,
                    inputs: Inventory.multiply(data.inputs as Record<string, number>, scaleFactor),
                    outputs: Inventory.multiply(data.outputs as Record<string, number>, scaleFactor),
                    equipment: data.equipment,
                    affectedByAtmosphere: data.affectedByAtmosphere,
                    affectedByFertility: data.affectedByFertility,
                    affectedByOcean: data.affectedByOcean,
                    affectedByResource: data.affectedByResource,
                };
            }),
        };
    },
});
