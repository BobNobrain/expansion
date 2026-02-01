import { createMemo } from 'solid-js';
import type { Inventory } from '@/domain/Inventory';
import type { Recipe } from '@/domain/Recipe';
import type { WorldTileConditions } from '@/domain/World';
import { useSingle, useSingleId } from '@/lib/datafront/utils';
import { dfBases, dfFactories, dfBaseEnvsByFactoryId } from '@/store/datafront';

export function useFactoryRelatedData(routeInfo: () => { factoryId: number }) {
    const factory = useSingle(dfFactories.useMany(useSingleId(() => routeInfo().factoryId)), {
        notFoundMessage: 'Cannot find this factory. Are you sure it exists and belongs to you?',
    });
    const base = useSingle(dfBases.useMany(useSingleId(() => factory.result()?.baseId ?? null)));
    const factoryConditionsQuery = useSingle(dfBaseEnvsByFactoryId.use(() => ({ factoryId: routeInfo().factoryId })));
    const factoryConditions = factoryConditionsQuery.result;

    const dynamicRecipes = createMemo((): Recipe[] => factoryConditions()?.dynamicRecipes ?? []);
    const tileConditions = createMemo(
        (): WorldTileConditions =>
            factoryConditions()?.tileConditions ?? {
                soilFertility: -1,
                atmosphericResources: [],
                oceanResources: [],
                snowResources: [],
                resources: [],
            },
    );

    const isFactoryLoading = () => factory.isLoading() || factoryConditionsQuery.isLoading();

    const baseInventory = createMemo((): Inventory | null => {
        const b = base.result();
        if (!b) {
            return null;
        }

        return b.inventory;
    });

    return { factory, base, dynamicRecipes, tileConditions, isFactoryLoading, baseInventory };
}
