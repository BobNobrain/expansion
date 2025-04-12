import { type Component } from 'solid-js';
import styles from './RecipeDisplay.module.css';

type Props = {
    animated: boolean | undefined;
};

export const Arrow: Component<Props> = (props) => {
    return (
        <div
            class={styles.arrow}
            classList={{
                [styles.animated]: props.animated,
            }}
        />
    );
};
