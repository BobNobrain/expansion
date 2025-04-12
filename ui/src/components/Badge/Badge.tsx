import { type ParentComponent, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { type Icon } from '../../icons';
import { type SemanticColor } from '../../lib/appearance';
import styles from './Badge.module.css';

export type BadgeStyle = 'default' | 'transparent';

export type BadgeProps = {
    color?: SemanticColor;
    style?: BadgeStyle;
    iconLeft?: Icon;
    iconRight?: Icon;
};

export const Badge: ParentComponent<BadgeProps> = (props) => {
    return (
        <div
            class={styles.badge}
            classList={{
                [styles[props.color ?? 'secondary']]: true,
                [styles[props.style ?? 'default']]: true,
            }}
        >
            <Show when={props.iconLeft}>
                <div class={styles.iconLeft}>
                    <Dynamic component={props.iconLeft} size={20} block />
                </div>
            </Show>

            <div class={styles.label}>{props.children}</div>

            <Show when={props.iconRight}>
                <div class={styles.iconRight}>
                    <Dynamic component={props.iconRight} size={20} block />
                </div>
            </Show>
        </div>
    );
};
