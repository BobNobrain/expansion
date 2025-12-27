import type { BuildingsAsset } from '../lib/assetmanager';
import { WorkforceData, type WorkforceType } from './City';
import { ConstructionCost } from './Commodity';
import type { Contribution } from './Contribution';
import { Inventory, type DynamicInventory } from './Inventory';
import type { Recipe } from './Recipe';
import type { WorldTileConditions } from './World';

export type BaseOverview = {
    id: number;
    worldId: string;
    tileId: string;
    cityId: number;

    created: Date;
    operator: string;

    nFactories: number;
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

    inventory: Inventory;
};

export enum FactoryStatus {
    Active = 'active',
    Halted = 'halted',
    Disabled = 'disabled',
}

export type Factory = {
    id: number;
    baseId: number;
    status: FactoryStatus;
    createdAt: Date;
    updatedTo: Date;

    equipment: FactoryEquipment[];
    inventory: DynamicInventory;
    employees: WorkforceData<number>;

    upgradeProject: {
        target: FactoryEquipmentPlan[];
        contribution: Contribution;
        lastUpdated: Date;
    };
};

export type FactoryEquipment = {
    equipmentId: string;
    count: number;
    production: FactoryProduction[];
    employees: WorkforceData<number>;
};

export type FactoryProduction = {
    recipe: Recipe;
    manualEfficiency: number;
};

export type FactoryEquipmentPlan = {
    equipmentId: string;
    count: number;
    production: FactoryProductionPlan[];
};

export type FactoryProductionPlan = {
    recipeId: string;
    manualEfficiency: number;
};

export type FactoryConfiguration = {
    equipment: Pick<FactoryEquipment, 'count' | 'equipmentId'>[];
};
export type FactoryConfigurationWithProduction = {
    equipment: FactoryEquipmentPlan[];
};

export namespace Factory {
    export function getEffectiveScales(equipment: FactoryEquipmentPlan): number[] {
        let totalWeights = 0;
        for (const productionItem of equipment.production) {
            totalWeights += productionItem.manualEfficiency;
        }

        if (totalWeights === 0) {
            totalWeights = 1;
        }

        const factor = equipment.count / totalWeights;

        const result: number[] = [];
        for (const productionItem of equipment.production) {
            result.push(productionItem.manualEfficiency * factor);
        }
        return result;
    }

    export function getTotalInOuts(
        recipes: Record<string, Recipe>,
        factory: FactoryConfigurationWithProduction,
    ): Inventory {
        const result = Inventory.empty();

        for (const equipment of factory.equipment) {
            const scales = getEffectiveScales(equipment);

            for (let i = 0; i < equipment.production.length; i++) {
                const production = equipment.production[i];
                const recipe = recipes[production.recipeId];
                if (!recipe) {
                    continue;
                }

                const effectiveScale = scales[i];

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

    export function getTotalArea(data: BuildingsAsset, factory: FactoryConfiguration): number {
        let total = 0;

        for (const equipment of factory.equipment) {
            const eqData = data.equipment[equipment.equipmentId];
            total += eqData.area * equipment.count;
        }

        return total;
    }

    export function getTotalEquipmentCount(factory: FactoryConfiguration): number {
        let total = 0;

        for (const equipment of factory.equipment) {
            total += equipment.count;
        }

        return total;
    }

    export function getConstructionCost(data: BuildingsAsset, factory: FactoryConfiguration): ConstructionCost {
        const totalCost = ConstructionCost.empty();

        for (const equipment of factory.equipment) {
            ConstructionCost.add(
                totalCost,
                Equipment.getConstructionCost(data, equipment.equipmentId, { count: equipment.count }),
            );
        }

        return totalCost;
    }

    export function getTotalJobs(data: BuildingsAsset, factory: FactoryConfiguration): WorkforceData<number> {
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

    export function isUpgradeInProgress(f: Pick<Factory, 'upgradeProject'>): boolean {
        return f.upgradeProject.contribution.contributions.length > 0;
    }
    export function hasUpgradePlanned(f: Pick<Factory, 'upgradeProject'>): boolean {
        return f.upgradeProject.target.length > 0;
    }

    export function getCurrentConfiguration(f: Factory): FactoryConfigurationWithProduction {
        return {
            equipment: f.equipment.map(
                (eq): FactoryEquipmentPlan => ({
                    equipmentId: eq.equipmentId,
                    count: eq.count,
                    production: eq.production.map(
                        (prod): FactoryProductionPlan => ({
                            recipeId: prod.recipe.id,
                            manualEfficiency: prod.manualEfficiency,
                        }),
                    ),
                }),
            ),
        };
    }
    export function getUpgradeConfiguration(f: Factory): FactoryConfigurationWithProduction {
        return { equipment: f.upgradeProject.target };
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

export type BaseEnvs = {
    dynamicRecipes: Recipe[];
    tileConditions: WorldTileConditions;
};
