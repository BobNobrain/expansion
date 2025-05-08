import type buildingsRawAsset from '../../../assets/buildings.generated.json';
import type commoditiesRawAsset from '../../../assets/commodities.generated.json';
import type { Building, Equipment } from '../../domain/Base';
import type { CommodityData } from '../../domain/Commodity';
import { mapValues } from '../misc';
import { type Asset, createJSONAsset } from './asset';

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
