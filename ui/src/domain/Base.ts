import type { BuildingsAsset } from '../lib/assetmanager';
import { WorkforceData, type WorkforceType } from './City';
import { ConstructionCost } from './Commodity';
import { Inventory } from './Inventory';
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
    operator: string;

    factories: Factory[];
    constructionSites: BaseConstructionSite[];
};

export type Factory = {
    id: number;
    equipment: FactoryEquipment[];
};

export type FactoryEquipment = {
    equipmentId: string;
    count: number;
    production: Record<string, FactoryProduction>;
    employees: WorkforceData<number>;
};

export type FactoryProduction = {
    recipeId: number;
    manualEfficiency: number;
    dynamicOutputs: Record<string, number>;
};

export namespace Factory {
    export function getEffectiveScales(equipment: FactoryEquipment): Record<string, number> {
        let totalWeights = 0;
        for (const productionItem of Object.values(equipment.production)) {
            totalWeights += productionItem.manualEfficiency;
        }

        if (totalWeights === 0) {
            totalWeights = 1;
        }

        const factor = equipment.count / totalWeights;

        const result: Record<string, number> = {};
        for (const [key, productionItem] of Object.entries(equipment.production)) {
            result[key] = productionItem.manualEfficiency * factor;
        }
        return result;
    }

    export function getTotalInOuts(recipes: Record<string, Recipe>, factory: Pick<Factory, 'equipment'>): Inventory {
        const result = Inventory.empty();

        for (const equipment of factory.equipment) {
            const scales = getEffectiveScales(equipment);

            for (const production of Object.values(equipment.production)) {
                const recipe = recipes[production.recipeId];
                if (!recipe) {
                    continue;
                }

                const effectiveScale = scales[production.recipeId];

                for (const [cid, delta] of Object.entries(recipe.inputs)) {
                    result[cid] ??= 0;
                    result[cid] -= delta * effectiveScale;
                }

                for (const [cid, delta] of Object.entries(recipe.outputs)) {
                    result[cid] ??= 0;
                    result[cid] += delta * effectiveScale;
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

    export function getTotalJobs(data: BuildingsAsset, factory: Pick<Factory, 'equipment'>): WorkforceData<number> {
        const result = WorkforceData.empty<number>();

        for (const eq of factory.equipment) {
            const eqData = data.equipment[eq.equipmentId];
            if (!eqData) {
                continue;
            }

            WorkforceData.mix(result, eqData.workforce, (acc, current) => (acc ?? 0) + current.count * eq.count);
        }

        return result;
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
    constructedFrom: Record<string, number>;

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

        for (const [mat, amount] of Object.entries(eqData.constructedFrom)) {
            result[mat] = amount * count;
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
