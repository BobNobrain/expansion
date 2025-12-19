import { createContext, createEffect, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { Factory, FactoryEquipmentPlan, FactoryProductionPlan } from '@/domain/Base';
import type { Inventory } from '@/domain/Inventory';
import type { Recipe } from '@/domain/Recipe';
import type { WorldTileConditions } from '@/domain/World';
import { outOfContext } from '@/lib/solid/context';

export type FactoryDisplayState = {
    factoryEquipment: FactoryEquipmentPlan[];

    isEditingEfficiencies: boolean;
    equipmentIndexForRecipeSelector: number;
};

export type FactoryDisplayEditResult = Pick<Factory['upgradeProject'], 'target'>;
export type FactoryDisplayRebalanceResult = Pick<Factory['upgradeProject'], 'target'>;

export function createState(initial: () => Factory | null) {
    const initialState: FactoryDisplayState = {
        factoryEquipment: getInitialStateEquipment(initial()),

        isEditingEfficiencies: false,
        equipmentIndexForRecipeSelector: -1,
    };

    const [state, updateState] = createStore<FactoryDisplayState>(initialState);

    const resetState = () => {
        updateState('factoryEquipment', () => getInitialStateEquipment(initial()));
    };

    createEffect(() => {
        updateState('factoryEquipment', () => getInitialStateEquipment(initial()));
    });

    return {
        state,
        updateState,
        resetState,

        validateAndGetResult: (): FactoryDisplayEditResult | null => {
            if (!state.factoryEquipment.length) {
                return null;
            }

            for (const eq of state.factoryEquipment) {
                if (eq.count <= 0 || eq.production.length === 0) {
                    return null;
                }

                let allManualEfficienciesAreZero = true;
                for (const prod of eq.production) {
                    if (prod.manualEfficiency !== 0) {
                        allManualEfficienciesAreZero = false;
                        break;
                    }
                }

                if (allManualEfficienciesAreZero) {
                    return null;
                }
            }

            return {
                target: state.factoryEquipment.slice(),
            };
        },
    };
}
function getInitialStateEquipment(f: Factory | null): FactoryEquipmentPlan[] {
    if (!f) {
        return [];
    }

    if (f.upgradeProject.target.length) {
        // a deep copy
        return f.upgradeProject.target.map((eq) => ({ ...eq, production: eq.production.map((prod) => ({ ...prod })) }));
    }

    return f.equipment.map(
        (eq): FactoryEquipmentPlan => ({
            equipmentId: eq.equipmentId,
            count: eq.count,
            production: eq.production.map((prod): FactoryProductionPlan => {
                return {
                    recipeId: prod.recipe.id,
                    manualEfficiency: prod.manualEfficiency,
                };
            }),
        }),
    );
}

type FactoryDisplayContext = Omit<ReturnType<typeof createState>, 'validateAndGetResult'> & {
    factory: () => Factory | null;
    isEditable: () => boolean;
    isRebalanceEnabled: () => boolean;
    isLoading: () => boolean;
    availableArea: () => number;
    tileId: () => string | null;
    worldId: () => string | null;
    baseInventory: () => Inventory | null;
    tileConditions: () => WorldTileConditions;

    onUpgrade: (f: Factory, ev: MouseEvent) => void;

    isRebalanceInProgress: () => boolean;
    onRebalance: (rebalance: FactoryDisplayRebalanceResult) => void;

    isSubmittingContribution: () => boolean;
    onSubmitContribution: (contribution: Inventory) => void;

    allRecipes: () => Record<string, Recipe>;
    allRecipesList: () => Recipe[];
    // selectedEquipment: () => FactoryEquipmentPlan | null;
};

const FactoryDisplayContext = createContext<FactoryDisplayContext>({
    get state() {
        return outOfContext();
    },
    updateState: outOfContext,
    resetState: outOfContext,

    factory: outOfContext,
    isEditable: outOfContext,
    isRebalanceEnabled: outOfContext,

    isLoading: outOfContext,
    availableArea: outOfContext,
    tileId: outOfContext,
    worldId: outOfContext,
    baseInventory: outOfContext,
    tileConditions: outOfContext,

    isRebalanceInProgress: outOfContext,
    onRebalance: outOfContext,

    onUpgrade: outOfContext,

    isSubmittingContribution: outOfContext,
    onSubmitContribution: outOfContext,

    allRecipes: outOfContext,
    allRecipesList: outOfContext,
    // selectedEquipment: outOfContext,
});

export const FactoryDisplayContextProvider = FactoryDisplayContext.Provider;
export const useFactoryDisplayContext = () => useContext(FactoryDisplayContext);
