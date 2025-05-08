import type { BuildingsAsset } from '../lib/assetmanager';
import type { WorkforceType } from './City';
import type { ConstructionCost } from './Commodity';

export type BaseOverview = {
    id: number;
    worldId: string;
    tileId: string;

    created: Date;

    nEquipment: number;
    /** 0..1 */
    areaUsage: number;
    /** 0..1 */
    inventoryUsage: number;
    /** 0..1 */
    employment: number;
};

export type Building = {
    id: string;
    matsPerArea: Record<string, number>;
};

export type Equipment = {
    id: string;
    building: string;
    area: number;
    workforce: Partial<Record<WorkforceType, { count: number; contribution: number }>>;

    requiresSoil?: boolean;
    requiresMinerals?: boolean;
    requiresLiquids?: boolean;
    requiresGases?: boolean;
};

export namespace Equipment {
    type GetConstructionCostOptions = {
        count?: number;
    };

    export function getConstructionCost(
        data: BuildingsAsset,
        equipmentId: string,
        { count = 1 }: GetConstructionCostOptions = {},
    ): ConstructionCost {
        const eqData = data.equipment[equipmentId];
        if (!eqData) {
            return {};
        }

        const buildingData = data.buildings[eqData.building];
        if (!buildingData) {
            return {};
        }

        const result: ConstructionCost = {};
        for (const [mat, amount] of Object.entries(buildingData.matsPerArea)) {
            result[mat] = amount * eqData.area * count;
        }

        // TODO: calculate in additional materials for environmental hazards
        return result;
    }
}

export type BaseConstructionSite = {
    id: number;
    equipment: string;
    area: number;
    total: ConstructionCost;
    provided: ConstructionCost;
    autoBuild: boolean;
};
