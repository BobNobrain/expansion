import { type Component, For, type JSX } from 'solid-js';
import { CommodityIconWithLabel } from '../CommodityIcon';
import { Arrow } from './Arrow';
import styles from './RecipeDisplay.module.css';

export type RecipeDisplayIngridient = {
    commodityId: string;
    style?: 'red' | 'green' | 'default';
    speed: string;
};

export type RecipeDisplayProps = {
    inputs: RecipeDisplayIngridient[];
    outputs: RecipeDisplayIngridient[];
    animatedArrow?: boolean;
    aboveArrow?: JSX.Element;
    belowArrow?: JSX.Element;
};

const RecipeIngridients: Component<{ items: RecipeDisplayIngridient[] }> = (props) => {
    return (
        <ul class={styles.ingridientsList}>
            <For each={props.items}>
                {(ingridient) => (
                    <li
                        class={styles.ingridient}
                        classList={{
                            [styles[ingridient.style ?? 'default']]: true,
                        }}
                    >
                        <CommodityIconWithLabel resource={ingridient.commodityId} />
                        <div class={styles.ingridientSpeed}>{ingridient.speed}</div>
                    </li>
                )}
            </For>
        </ul>
    );
};

export const RecipeDisplay: Component<RecipeDisplayProps> = (props) => {
    return (
        <div class={styles.recipe}>
            <RecipeIngridients items={props.inputs} />
            <div class={styles.arrowWrapper}>
                <div class={styles.above}>{props.aboveArrow}</div>
                <Arrow animated={props.animatedArrow} />
                <div class={styles.below}>{props.belowArrow}</div>
            </div>
            <RecipeIngridients items={props.outputs} />
        </div>
    );
};
