import { type ParentProps, type Component, Show } from 'solid-js';
import { type SemanticColor } from '../../lib/appearance';
import themes from './themes.module.css';
import styles from './Button.module.css';

export type ButtonWing = 'none' | 'up' | 'down';

export type ButtonProps = ParentProps & {
    theme?: SemanticColor;
    leftWing?: ButtonWing;
    rightWing?: ButtonWing;

    disabled?: boolean;
    loading?: boolean;

    onClick?: (ev: MouseEvent) => void;
};

export const Button: Component<ButtonProps> = (props) => {
    const onClick = (ev: MouseEvent) => {
        if (!props.onClick || props.loading || props.disabled) {
            return;
        }

        props.onClick(ev);
    };

    return (
        <button
            class={styles.button}
            classList={{
                [themes[props.theme ?? 'secondary']]: !props.disabled,
                [styles[`${props.leftWing ?? 'down'}LeftWing`]]: true,
                [styles[`${props.rightWing ?? 'up'}RightWing`]]: true,
                [styles.disabled]: props.disabled,
                [styles.loading]: props.loading && !props.disabled,
            }}
            onClick={onClick}
        >
            <Show when={props.loading}>
                <div class={styles.loader} />
            </Show>
            {props.children}
        </button>
    );
};
