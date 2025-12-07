import { Inventory } from '@/domain/Inventory';
import type { Recipe } from '@/domain/Recipe';
import type { BaseEnvs } from '@/domain/Base';
import { createDatafrontTable } from '@/lib/datafront/table';
import {
    BaseEnvsQueryTypeByFactoryID,
    type BaseEnvsQueryByFactoryID,
    BaseEnvsTableName,
    type BaseEnvsTableRow,
} from '@/lib/net/types.generated';
import { ws } from '@/lib/net/ws';
import { updater, cleaner } from './misc';

export const dfBaseEnvs = createDatafrontTable<BaseEnvsTableRow, BaseEnvs>({
    name: BaseEnvsTableName,
    ws,
    updater,
    cleaner,
    map: (data) => {
        return {
            dynamicRecipes: data.recipes.map(
                (rData): Recipe => ({
                    id: rData.recipeId,
                    equipment: rData.equipmentId,
                    inputs: Inventory.from(rData.inputs),
                    outputs: Inventory.from(rData.outputs),
                }),
            ),
            tileConditions: {
                soilFertility: data.tileFertility,
                atmosphericResources: data.atmosphere,
                oceanResources: data.ocean,
                snowResources: data.snow,
                resources: data.resources,
            },
        };
    },
});

export const dfBaseEnvsByFactoryId = dfBaseEnvs.createQuery<BaseEnvsQueryByFactoryID>(
    BaseEnvsQueryTypeByFactoryID,
    (payload) => payload.factoryId.toString(),
);
