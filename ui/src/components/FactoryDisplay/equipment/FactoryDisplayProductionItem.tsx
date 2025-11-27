import { createMemo, Show, type Component } from 'solid-js';
import { HBarRow, HBarSlider, Text } from '@/atoms';
import { RecipeDisplay } from '@/components/RecipeDisplay/RecipeDisplay';
import { Factory, type FactoryEquipment } from '@/domain/Base';
import { Inventory } from '@/domain/Inventory';
import type { Recipe } from '@/domain/Recipe';
import type { SemanticColor } from '@/lib/appearance';
import { recipesAsset } from '@/lib/assetmanager';
import { useAsset } from '@/lib/solid/asset';
import { formatPercentage } from '@/lib/strings';
import styles from './styles.module.css';

export const FactoryDisplayProductionItem: Component<{
    equipment: FactoryEquipment;
    recipeId: number;
    efficiencyEditable: boolean;
    onShareUpdate: (value: number) => void;
}> = (props) => {
    const recipes = useAsset(recipesAsset);

    const effectiveScale = createMemo((): number => Factory.getEffectiveScales(props.equipment)[props.recipeId] ?? 0);

    const getInOuts = createMemo((): Pick<Recipe, 'inputs' | 'outputs'> => {
        const result: Pick<Recipe, 'inputs' | 'outputs'> = { inputs: {}, outputs: {} };

        const recipesData = recipes();
        if (!recipesData) {
            return result;
        }

        const recipe = recipesData.recipes[props.recipeId];
        if (!recipe) {
            return result;
        }

        const productionScale = effectiveScale();
        result.inputs = Inventory.multiply(recipe.inputs, productionScale);
        result.outputs = Inventory.multiply(recipe.outputs, productionScale);

        return result;
    });

    const efficiencyTextColor = (): SemanticColor | undefined => {
        switch (props.equipment.production[props.recipeId]?.manualEfficiency) {
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

    const manualEfficiency = createMemo(() => props.equipment.production[props.recipeId]?.manualEfficiency ?? 0);

    return (
        <div class={styles.productionItem}>
            <RecipeDisplay
                inputs={getInOuts()?.inputs ?? {}}
                outputs={getInOuts()?.outputs ?? {}}
                aboveArrow={
                    <Text color={efficiencyTextColor()}>
                        {formatPercentage(effectiveScale() / props.equipment.count)}
                    </Text>
                }
            />
            <Show when={props.efficiencyEditable}>
                <div class={styles.productionItemSlider}>
                    <HBarRow height="full">
                        <HBarSlider
                            share={1}
                            value={manualEfficiency()}
                            valueStep={0.01}
                            onUpdate={props.onShareUpdate}
                            left={{
                                color: manualEfficiency() === 1 ? 'secondary' : 'primary',
                                style: 'hollow',
                            }}
                            right={{
                                style: 'hollow',
                                color: manualEfficiency() === 0 ? 'error' : 'secondary',
                            }}
                        />
                    </HBarRow>
                </div>
            </Show>
        </div>
    );
};
