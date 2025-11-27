import { createEffect, createMemo, createSignal, For, type Component } from 'solid-js';
import { Button, List, ListItem, PageHeader, PageHeaderActions, PageHeaderTitle } from '@/atoms';
import { RecipeDisplay } from '@/components/RecipeDisplay/RecipeDisplay';
import type { FactoryProduction } from '@/domain/Base';
import { TouchBottomSheet } from '@/touch/components/TouchBottomSheet/TouchBottomSheet';
import { useRecipesList, useSelectedEquipment } from '../hooks';
import { useFactoryDisplayContext } from '../state';

export const SelectRecipeSheet: Component<{
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
}> = (props) => {
    const { state, updateState } = useFactoryDisplayContext();

    const selectedEquipment = useSelectedEquipment();

    const selectedEquipmentRecipeIds = createMemo(() =>
        Object.values(selectedEquipment()?.production ?? {}).map((pr) => pr.recipeId),
    );

    const [getRecipeIds, setRecipeIds] = createSignal(new Set<number>(selectedEquipmentRecipeIds()));
    createEffect(() => {
        setRecipeIds(new Set<number>(selectedEquipmentRecipeIds()));
    });

    const recipes = useRecipesList(selectedEquipment);

    return (
        <TouchBottomSheet
            isOpen={props.isOpen}
            onClose={() => props.setIsOpen(false)}
            header={
                <PageHeader>
                    <PageHeaderTitle>Select Recipes</PageHeaderTitle>
                    <PageHeaderActions pushRight>
                        <Button
                            disabled={getRecipeIds().size === 0}
                            onClick={() => {
                                const productionItems = Array.from(getRecipeIds().values()).map(
                                    (recipeId): FactoryProduction => {
                                        return {
                                            recipeId,
                                            manualEfficiency: 1,
                                            dynamicOutputs: {},
                                        };
                                    },
                                );

                                const result: Record<string, FactoryProduction> = {};

                                for (const item of productionItems) {
                                    result[item.recipeId] = item;
                                }

                                updateState('factoryEquipment', state.equipmentIndexForRecipeSelector, {
                                    production: result,
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
