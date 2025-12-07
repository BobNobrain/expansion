import {
    type Factory,
    type FactoryEquipment,
    type FactoryEquipmentPlan,
    type FactoryProduction,
    type FactoryStatus,
} from '@/domain/Base';
import { WorkforceData } from '@/domain/City';
import { Inventory } from '@/domain/Inventory';
import { createDatafrontTable } from '@/lib/datafront/table';
import {
    FactoriesQueryTypeByBaseID,
    type FactoriesQueryByBaseID,
    FactoriesTableName,
    type FactoriesTableRow,
} from '@/lib/net/types.generated';
import { ws } from '@/lib/net/ws';
import { updater, cleaner } from './misc';

export const dfFactories = createDatafrontTable<FactoriesTableRow, Factory>({
    name: FactoriesTableName,
    ws,
    updater,
    cleaner,
    map: (data) => {
        const result: Factory = {
            id: data.id,
            equipment: data.equipment.map((eqData): FactoryEquipment => {
                return {
                    equipmentId: eqData.equipmentId,
                    count: eqData.count,
                    employees: WorkforceData.empty<number>(),
                    production: eqData.production.map((prData): FactoryProduction => {
                        return {
                            recipe: {
                                id: prData.recipeId,
                                equipment: eqData.equipmentId,
                                inputs: Inventory.from(prData.inputs),
                                outputs: Inventory.from(prData.outputs),
                            },
                            manualEfficiency: prData.manualEfficiency,
                        };
                    }),
                };
            }),

            baseId: data.baseId,
            createdAt: new Date(data.created),
            employees: data.employees,
            inventory: Inventory.from(data.inventory),
            status: data.status as FactoryStatus,
            updatedTo: new Date(data.updatedTo),

            upgradeProject: {
                target:
                    data.upgradeTarget?.map((eqData): FactoryEquipmentPlan => {
                        return {
                            equipmentId: eqData.equipmentId,
                            count: eqData.count,
                            production: eqData.production.map((prData) => ({
                                recipeId: prData.recipeId,
                                manualEfficiency: prData.manualEfficiency,
                            })),
                        };
                    }) ?? [],
                contribution: {
                    required: Inventory.from(data.upgradeContribution?.required ?? {}),
                    contributions:
                        data.upgradeContribution?.history.map((cData) => ({
                            amounts: Inventory.from(cData.delta),
                            contributor: cData.author,
                            date: new Date(cData.date),
                        })) ?? [],
                },
                lastUpdated: new Date(data.upgradeLastUpdated),
            },
        };

        return result;
    },
});

export const dfFactoriesByBaseId = dfFactories.createQuery<FactoriesQueryByBaseID>(
    FactoriesQueryTypeByBaseID,
    (payload) => payload.baseId.toString(),
);
