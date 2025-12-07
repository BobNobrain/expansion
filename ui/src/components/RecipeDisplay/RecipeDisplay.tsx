import { type Component, createMemo, For, type JSX, Show } from 'solid-js';
import { Commodity } from '@/domain/Commodity';
import { useAsset } from '@/lib/solid/asset';
import { commoditiesAsset, type CommoditiesAsset } from '@/lib/assetmanager';
import { CommodityIconWithLabel } from '../CommodityIcon';
import { Arrow } from './Arrow';
import styles from './RecipeDisplay.module.css';
import { SkeletonText, Text } from '@/atoms';

export type RecipeDisplayIngridient = {
    commodityId: string;
    style?: 'red' | 'green' | 'default';
    speed: string;
};

export type RecipeDisplayProps = {
    inputs: RecipeDisplayIngridient[] | Record<string, number>;
    outputs: RecipeDisplayIngridient[] | Record<string, number>;
    animatedArrow?: boolean;
    aboveArrow?: JSX.Element;
    belowArrow?: JSX.Element;

    onClick?: (ev: MouseEvent) => void;
    isLoading?: boolean;
};

const RecipeIngridients: Component<{ items: RecipeDisplayIngridient[]; isLoading: boolean | undefined }> = (props) => {
    return (
        <ul class={styles.ingridientsList}>
            <For
                each={props.items}
                fallback={
                    <li
                        class={styles.ingridient}
                        classList={{
                            [styles.emptyIngridient]: true,
                        }}
                    >
                        <Text color="dim" size="large">
                            (nothing)
                        </Text>
                    </li>
                }
            >
                {(ingridient) => (
                    <li
                        class={styles.ingridient}
                        classList={{
                            [styles[ingridient.style ?? 'default']]: true,
                        }}
                    >
                        <CommodityIconWithLabel
                            size="md"
                            commodity={ingridient.commodityId}
                            secondLine={
                                <span class={styles.ingridientSpeed}>
                                    <Show when={props.isLoading} fallback={ingridient.speed}>
                                        <SkeletonText length={4} />
                                    </Show>
                                </span>
                            }
                            secondLineAlignment="right"
                            isLoading={props.isLoading}
                        />
                    </li>
                )}
            </For>
        </ul>
    );
};

export const RecipeDisplay: Component<RecipeDisplayProps> = (props) => {
    const commodities = useAsset(commoditiesAsset);

    const inputs = createMemo(() => {
        if (props.isLoading) {
            return [{ commodityId: '', speed: '' }];
        }

        if (Array.isArray(props.inputs)) {
            return props.inputs;
        }

        return displayIngridients(commodities(), props.inputs, 'red', -1);
    });

    const outputs = createMemo(() => {
        if (props.isLoading) {
            return [{ commodityId: '', speed: '' }];
        }

        if (Array.isArray(props.outputs)) {
            return props.outputs;
        }

        return displayIngridients(commodities(), props.outputs, 'green');
    });

    return (
        <div class={styles.recipe} onClick={props.onClick}>
            <RecipeIngridients items={inputs()} isLoading={props.isLoading} />
            <div class={styles.arrowWrapper}>
                <div class={styles.above}>{props.aboveArrow}</div>
                <Arrow animated={props.animatedArrow} />
                <div class={styles.below}>{props.belowArrow}</div>
            </div>
            <RecipeIngridients items={outputs()} isLoading={props.isLoading} />
        </div>
    );
};

function displayIngridients(
    cmds: CommoditiesAsset | null,
    inv: Record<string, number>,
    style: RecipeDisplayIngridient['style'],
    multiplier = 1,
): RecipeDisplayIngridient[] {
    return Object.entries(inv).map(([cid, amount]) => ({
        commodityId: cid,
        speed: Commodity.stringifyAmount(cmds ? cmds[cid] : undefined, amount * multiplier, { explicitPlusSign: true }),
        style,
    }));
}
