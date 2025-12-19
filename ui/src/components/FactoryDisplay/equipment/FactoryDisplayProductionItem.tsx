import { createMemo, Show, type Component } from 'solid-js';
import { HBarRow, HBarSlider, Text } from '@/atoms';
import { RecipeDisplay } from '@/components/RecipeDisplay/RecipeDisplay';
import { Inventory } from '@/domain/Inventory';
import type { Recipe } from '@/domain/Recipe';
import type { SemanticColor } from '@/lib/appearance';
import { formatPercentage } from '@/lib/strings';
import { useFactoryDisplayContext } from '../state';
import styles from './styles.module.css';

export const FactoryDisplayProductionItem: Component<{
    recipeId: string;
    effectiveScale: number;
    equipmentCount: number;
    manualEfficiency: number;

    efficiencyEditable: boolean;
    onShareUpdate: (value: number) => void;
}> = (props) => {
    const { allRecipes } = useFactoryDisplayContext();
    const recipeData = createMemo(() => allRecipes()[props.recipeId]);

    const getInOuts = createMemo((): Pick<Recipe, 'inputs' | 'outputs'> => {
        const result: Pick<Recipe, 'inputs' | 'outputs'> = { inputs: {}, outputs: {} };

        const productionScale = props.effectiveScale;
        const recipe = recipeData();
        if (!recipe) {
            return result;
        }

        result.inputs = Inventory.multiply(recipe.inputs, productionScale);
        result.outputs = Inventory.multiply(recipe.outputs, productionScale);

        return result;
    });

    const efficiencyTextColor = (): SemanticColor | undefined => {
        switch (props.manualEfficiency) {
            case 1:
                return undefined;

            case 0:
                return 'error';

            case undefined:
                return 'accent';

            default:
                return 'primary';
        }
    };

    return (
        <div class={styles.productionItem}>
            <RecipeDisplay
                isLoading={!recipeData()}
                inputs={getInOuts()?.inputs ?? {}}
                outputs={getInOuts()?.outputs ?? {}}
                aboveArrow={
                    <Text color={efficiencyTextColor()}>
                        {/* effective scale also accounts for the equipment count being used, so to get a relative share
                        of this recipe in 0%-100% range, one must divide this effective scale by the equipment count */}
                        {formatPercentage(props.effectiveScale / props.equipmentCount)}
                    </Text>
                }
                belowArrow="1h"
            />
            <Show when={props.efficiencyEditable}>
                <div class={styles.productionItemSlider}>
                    <HBarRow height="full">
                        <HBarSlider
                            share={1}
                            value={props.manualEfficiency}
                            valueStep={0.01}
                            onUpdate={props.onShareUpdate}
                            left={{
                                color: props.manualEfficiency === 1 ? 'secondary' : 'primary',
                                style: 'hollow',
                            }}
                            right={{
                                style: 'hollow',
                                color: props.manualEfficiency === 0 ? 'error' : 'secondary',
                            }}
                        />
                    </HBarRow>
                </div>
            </Show>
        </div>
    );
};
