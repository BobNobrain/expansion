import { createMemo } from 'solid-js';
import { Factory } from '@/domain/Base';
import type { Inventory } from '@/domain/Inventory';
import { useFactoryDisplayContext } from '../state';

export function useTotalInOuts() {
    const { state, allRecipes } = useFactoryDisplayContext();

    const totalInOuts = createMemo((): Inventory => {
        const recipes = allRecipes();

        const equipment = state.factoryEquipment;
        const total = Factory.getTotalInOuts(recipes, { equipment });

        return total;
    });

    return totalInOuts;
}
