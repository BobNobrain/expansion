import type { ParentComponent } from 'solid-js';
import type { Factory } from '@/domain/Base';
import type { Recipe } from '@/domain/Recipe';
import type { WorldTileConditions } from '@/domain/World';
import { createState, FactoryDisplayContextProvider } from './state';

export type FactoryDisplayProps = {
    factory: Factory | null;
    editable?: boolean;

    availableArea: number;
    tileConditions: WorldTileConditions;
    dynamicRecipes: Record<number, Recipe[]>;
    isLoading: boolean;

    onSubmit?: (updated: Factory) => void;
};

export const FactoryDisplay: ParentComponent<FactoryDisplayProps> = (props) => {
    const { state, getFactory, updateState } = createState(props.factory, { isEditable: props.editable ?? false });

    return (
        <FactoryDisplayContextProvider
            value={{
                state,
                updateState,

                availableArea: () => props.availableArea,
                tileConditions: () => props.tileConditions,
                dynamicRecipes: () => props.dynamicRecipes,
                isLoading: () => props.isLoading,
            }}
        >
            {props.children}
        </FactoryDisplayContextProvider>
    );
};
