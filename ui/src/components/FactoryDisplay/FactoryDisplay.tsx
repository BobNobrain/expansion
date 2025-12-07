import { createMemo, type ParentComponent } from 'solid-js';
import type { Factory } from '@/domain/Base';
import type { Inventory } from '@/domain/Inventory';
import type { Recipe } from '@/domain/Recipe';
import type { WorldTileConditions } from '@/domain/World';
import { staticRecipesAsset } from '@/lib/assetmanager';
import { useAsset } from '@/lib/solid/asset';
import { createFormController, useFormControllerRef, type FormController } from '@/lib/solid/form';
import {
    createState,
    FactoryDisplayContextProvider,
    type FactoryDisplayEditResult,
    type FactoryDisplayRebalanceResult,
} from './state';

export type FactoryDisplayProps = {
    factory: Factory | null;
    editable?: boolean;
    onRebalance?: (rebalance: FactoryDisplayRebalanceResult) => void;

    availableArea: number;
    tileConditions: WorldTileConditions;
    dynamicRecipes: Recipe[];
    isLoading: boolean;

    worldId: string | null;
    tileId: string | null;
    baseInventory: Inventory | null;

    formControllerRef?: (c: FormController<FactoryDisplayEditResult>) => void;
    onUpgrade?: (f: Factory, ev: MouseEvent) => void;
};

export const FactoryDisplay: ParentComponent<FactoryDisplayProps> = (props) => {
    const { state, validateAndGetResult, updateState } = createState(() => props.factory);

    const controller = createFormController({ validateAndGetResult });
    useFormControllerRef(controller.controller, props, 'formControllerRef');

    const updateStateWithNotify: typeof updateState = (...args: unknown[]) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, prefer-spread
        updateState.apply(null, args as never);
        controller.onDataUpdated();
    };

    const recipesData = useAsset(staticRecipesAsset);
    const allRecipesList = createMemo(() => {
        const recipes = recipesData();
        if (!recipes) {
            return [];
        }

        const statics = recipes.recipes;
        const dynamics = props.dynamicRecipes;

        if (!dynamics.length) {
            return statics;
        }

        return statics.concat(dynamics);
    });
    const allRecipes = createMemo(() => {
        const list = allRecipesList();
        const map: Record<string, Recipe> = {};
        for (const recipe of list) {
            map[recipe.id] = recipe;
        }
        return map;
    });

    return (
        <FactoryDisplayContextProvider
            value={{
                state,
                updateState: updateStateWithNotify,

                factory: () => props.factory,
                isEditable: () => props.editable,
                isRebalanceEnabled: () => Boolean(props.onRebalance),
                onRebalance: (r) => props.onRebalance?.(r),

                availableArea: () => props.availableArea,
                tileId: () => props.tileId,
                worldId: () => props.worldId,
                baseInventory: () => props.baseInventory,
                tileConditions: () => props.tileConditions,
                isLoading: () => props.isLoading,
                onUpgrade: (f, ev) => props.onUpgrade?.(f, ev),

                allRecipesList,
                allRecipes,
            }}
        >
            {props.children}
        </FactoryDisplayContextProvider>
    );
};
