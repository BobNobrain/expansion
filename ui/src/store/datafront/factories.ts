import { type Factory, type FactoryEquipment, type FactoryProduction } from '@/domain/Base';
import { createDatafrontTable } from '@/lib/datafront/table';
import {
    FactoriesQueryTypeByBaseID,
    type FactoriesQueryByBaseID,
    type FactoriesTableRow,
} from '@/lib/net/types.generated';
import { ws } from '@/lib/net/ws';
import { updater, cleaner } from './misc';
import { WorkforceData } from '@/domain/City';

export const dfFactories = createDatafrontTable<FactoriesTableRow, Factory>({
    name: 'factories',
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
                    production: eqData.production
                        .map((prData) => {
                            return {
                                recipeId: prData.recipeId,
                                efficiency: prData.manualEfficiency,
                                dynamicOutputs: prData.dynamicOutputs,
                            };
                        })
                        .reduce<Record<string, FactoryProduction>>((acc, next) => {
                            acc[next.recipeId] = next;
                            return acc;
                        }, {}),
                };
            }),
        };

        return result;
    },
});

export const dfFactoriesByBaseId = dfFactories.createQuery<FactoriesQueryByBaseID>(
    FactoriesQueryTypeByBaseID,
    (payload) => payload.baseId.toString(),
);
