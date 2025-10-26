import { type ParentComponent } from 'solid-js';
import { type SemanticColor } from '@/lib/appearance';
import styles from './Island.module.css';

export type IslandStyle = 'solid' | 'outlined';

export type IslandProps = {
    color?: SemanticColor | 'background';
    style?: IslandStyle;
    padded?: boolean;
};

export const Island: ParentComponent<IslandProps> = (props) => {
    return (
        <div
            class={styles.island}
            classList={{
                [styles[props.color ?? 'secondary']]: true,
                [styles[props.style ?? 'solid']]: true,
                [styles.padded]: props.padded,
            }}
        >
            {props.children}
        </div>
    );
};
