import { createEffect, createMemo, createSignal, For, type Component } from 'solid-js';
import { Button, List, ListItem, PageHeader, PageHeaderActions, PageHeaderTitle } from '@/atoms';
import { RecipeDisplay } from '@/components/RecipeDisplay/RecipeDisplay';
import type { FactoryProductionPlan } from '@/domain/Base';
import { areSetsEqual } from '@/lib/misc';
import { TouchBottomSheet } from '@/touch/components/TouchBottomSheet/TouchBottomSheet';
import { useSelectedEquipment } from '../hooks';
import { useFactoryDisplayContext } from '../state';

export const SelectRecipeSheet: Component<{
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
}> = (props) => {
    const { state, updateState, allRecipesList } = useFactoryDisplayContext();

    const selectedEquipment = useSelectedEquipment();

    const selectedEquipmentRecipeIds = createMemo(() =>
        (selectedEquipment()?.production ?? []).map((pr) => pr.recipeId),
    );

    const [getRecipeIds, setRecipeIds] = createSignal(new Set<string>(selectedEquipmentRecipeIds()));
    createEffect(() => {
        setRecipeIds((oldIds) => {
            const newIds = new Set<string>(selectedEquipmentRecipeIds());
            if (areSetsEqual(oldIds, newIds)) {
                return oldIds;
            }

            return newIds;
        });
    });

    const recipes = createMemo(() => {
        const equipmentIndex = state.equipmentIndexForRecipeSelector;
        if (equipmentIndex === -1) {
            return [];
        }

        const equipmentId = state.factoryEquipment[equipmentIndex].equipmentId;
        return allRecipesList().filter((r) => r.equipment === equipmentId);
    });

    return (
        <TouchBottomSheet
            isOpen={props.isOpen}
            onClose={() => {
                updateState('equipmentIndexForRecipeSelector', -1);
                props.setIsOpen(false);
            }}
            header={
                <PageHeader>
                    <PageHeaderTitle>Select Recipes</PageHeaderTitle>
                    <PageHeaderActions pushRight>
                        <Button
                            disabled={getRecipeIds().size === 0}
                            onClick={() => {
                                const productionItems = Array.from(getRecipeIds().values()).map(
                                    (recipeId): FactoryProductionPlan => {
                                        return {
                                            recipeId,
                                            manualEfficiency: 1,
                                        };
                                    },
                                );
                                const index = state.equipmentIndexForRecipeSelector;
                                updateState('equipmentIndexForRecipeSelector', -1);

                                updateState('factoryEquipment', index, {
                                    production: productionItems,
                                });

                                props.setIsOpen(false);
                            }}
                        >
                            Confirm
                        </Button>
                    </PageHeaderActions>
                </PageHeader>
            }
        >
            <List>
                <For each={recipes()}>
                    {(recipe) => {
                        const isSelected = () => getRecipeIds().has(recipe.id);

                        return (
                            <ListItem selected={isSelected()}>
                                <RecipeDisplay
                                    inputs={recipe.inputs}
                                    outputs={recipe.outputs}
                                    belowArrow="1 hour"
                                    animatedArrow={isSelected()}
                                    onClick={() =>
                                        setRecipeIds((old) => {
                                            const copy = new Set(old);

                                            if (old.has(recipe.id)) {
                                                copy.delete(recipe.id);
                                            } else {
                                                copy.add(recipe.id);
                                            }

                                            return copy;
                                        })
                                    }
                                />
                            </ListItem>
                        );
                    }}
                </For>
            </List>
        </TouchBottomSheet>
    );
};
