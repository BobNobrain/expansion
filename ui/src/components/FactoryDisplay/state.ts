import { createContext, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { Factory, FactoryEquipment } from '@/domain/Base';
import type { Recipe } from '@/domain/Recipe';
import type { WorldTileConditions } from '@/domain/World';
import { outOfContext } from '@/lib/solid/context';

export type FactoryDisplayState = {
    factoryEquipment: FactoryEquipment[];

    isEditable: boolean;
    isEditingEfficiencies: boolean;
    equipmentIndexForRecipeSelector: number;
};

export function createState(initial: Factory | null, opts: { isEditable: boolean }) {
    const initialState: FactoryDisplayState = {
        factoryEquipment: initial?.equipment ?? [],

        isEditable: opts.isEditable,
        isEditingEfficiencies: false,
        equipmentIndexForRecipeSelector: -1,
    };

    const [state, updateState] = createStore<FactoryDisplayState>(initialState);

    return {
        state,
        updateState,

        getFactory: (): Factory => {
            return {
                id: initial ? initial.id : -1,
                equipment: state.factoryEquipment,
            };
        },
    };
}

type FactoryDisplayContext = Omit<ReturnType<typeof createState>, 'getFactory'> & {
    isLoading: () => boolean;
    availableArea: () => number;
    tileConditions: () => WorldTileConditions;
    dynamicRecipes: () => Record<number, Recipe[]>;
};

const FactoryDisplayContext = createContext<FactoryDisplayContext>({
    get state() {
        return outOfContext();
    },
    updateState: outOfContext,

    isLoading: outOfContext,
    availableArea: outOfContext,
    tileConditions: outOfContext,
    dynamicRecipes: outOfContext,
});

export const FactoryDisplayContextProvider = FactoryDisplayContext.Provider;
export const useFactoryDisplayContext = () => useContext(FactoryDisplayContext);
