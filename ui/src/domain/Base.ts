import type { BuildingsAsset } from '../lib/assetmanager';
import type { WorkforceData, WorkforceType } from './City';
import { ConstructionCost } from './Commodity';
import type { Recipe } from './Recipe';

export type BaseOverview = {
    id: number;
    worldId: string;
    tileId: string;

    created: Date;
    operator: string;

    nEquipment: number;
    /** 0..1 */
    areaUsage: number;
    /** 0..1 */
    inventoryUsage: number;
    /** 0..1 */
    employment: number;
};

export type BaseContent = {
    id: number;
    worldId: string;
    tileId: string;
    cityId: number;

    created: Date;

    factories: Factory[];
    constructionSites: BaseConstructionSite[];
};

export type Factory = {
    id: string;
    equipment: FactoryEquipment[];
};

export type FactoryEquipment = {
    equipmentId: string;
    count: number;
    production: Record<string, FactoryProduction>;
    employees: WorkforceData<number>;
};

export type FactoryProduction = {
    recipeId: string;
    efficiency: number;
};

export namespace Factory {
    export function getTotalInOuts(
        recipes: Record<string, Recipe>,
        factory: Pick<Factory, 'equipment'>,
    ): Record<string, number> {
        const result: Record<string, number> = {};

        for (const equipment of factory.equipment) {
            for (const production of Object.values(equipment.production)) {
                const recipe = recipes[production.recipeId];

                for (const [cid, delta] of Object.entries(recipe.inputs)) {
                    result[cid] ??= 0;
                    result[cid] -= delta * equipment.count * production.efficiency;
                }

                for (const [cid, delta] of Object.entries(recipe.inputs)) {
                    result[cid] ??= 0;
                    result[cid] += delta * equipment.count * production.efficiency;
                }
            }
        }

        return result;
    }

    export function getTotalArea(data: BuildingsAsset, factory: Pick<Factory, 'equipment'>): number {
        let total = 0;

        for (const equipment of factory.equipment) {
            const eqData = data.equipment[equipment.equipmentId];
            total += eqData.area * equipment.count;
        }

        return total;
    }

    export function getConstructionCost(data: BuildingsAsset, factory: Pick<Factory, 'equipment'>): ConstructionCost {
        const totalCost = ConstructionCost.empty();

        for (const equipment of factory.equipment) {
            ConstructionCost.add(
                totalCost,
                Equipment.getConstructionCost(data, equipment.equipmentId, { count: equipment.count }),
            );
        }

        return totalCost;
    }
}

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

export type ProductionGraph = {
    nodes: Record<number, ProductionGraphNode>;
    edges: Record<number, ProductionGraphEdge>;
};

export type ProductionGraphNode = {
    id: number;
    position: ProductionGraphPosition;
    equipmentId: string;
    count: number;

    inputs: number[];
    outputs: number[];
};

export type ProductionGraphEdge = {
    from: number;
    to: number;
    amount: number;
};

export type ProductionGraphPosition = {
    column: number;
    row: number;
};
