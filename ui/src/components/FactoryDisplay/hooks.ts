import { createMemo } from 'solid-js';
import type { Recipe } from '@/domain/Recipe';
import { recipesAsset } from '@/lib/assetmanager';
import { useAsset } from '@/lib/solid/asset';
import { useFactoryDisplayContext } from './state';
import type { FactoryEquipment } from '@/domain/Base';

export function useSelectedEquipment(): () => FactoryEquipment | null {
    const { state } = useFactoryDisplayContext();

    return createMemo((): FactoryEquipment | null => {
        if (
            state.equipmentIndexForRecipeSelector < 0 ||
            state.equipmentIndexForRecipeSelector >= state.factoryEquipment.length
        ) {
            return null;
        }
        return state.factoryEquipment[state.equipmentIndexForRecipeSelector];
    });
}

export function useRecipesList(filterByEquipment?: () => FactoryEquipment | null): () => Recipe[] {
    const recipesData = useAsset(recipesAsset);
    const { dynamicRecipes } = useFactoryDisplayContext();

    const isFittingEquipment = (r: Recipe): boolean => {
        if (!filterByEquipment) {
            return true;
        }

        return r.equipment === filterByEquipment()?.equipmentId;
    };

    return createMemo(() => {
        const recipes = recipesData();
        if (!recipes) {
            return [];
        }

        return recipes.recipes
            .filter((recipe) => isFittingEquipment(recipe) && !dynamicRecipes()[recipe.id])
            .concat(Object.values(dynamicRecipes()).flat().filter(isFittingEquipment));
    });
}
