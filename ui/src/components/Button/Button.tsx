import { type ParentProps, type Component, Show, createMemo } from 'solid-js';
import { type SemanticColor } from '../../lib/appearance';
import solidStyleColors from './solid.module.css';
import textStyleColors from './text.module.css';
import sizes from './sizes.module.css';
import common from './Button.module.css';

export type ButtonWing = 'none' | 'up' | 'down';
export type ButtonStyle = 'solid' | 'text';
export type ButtonSize = 's' | 'm';

export type ButtonProps = ParentProps & {
    color?: SemanticColor;
    style?: ButtonStyle;
    size?: ButtonSize;
    square?: boolean;
    compact?: boolean;

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

    const classList = createMemo<Record<string, boolean | undefined>>(() => {
        const color = props.color ?? 'secondary';
        const style = props.style ?? 'solid';
        const size = props.size ?? 'm';

        let colorClassName: string;
        switch (style) {
            case 'solid':
                colorClassName = solidStyleColors[color];
                break;

            case 'text':
                colorClassName = textStyleColors[color];
                break;
        }

        return {
            [colorClassName]: !props.disabled,
            [sizes[size]]: true,
            [common[style]]: true,
            [common.square]: props.square,
            [common.compact]: props.compact,
            [common.disabled]: props.disabled,
            [common.loading]: props.loading && !props.disabled,
        };
    });

    return (
        <button class={common.button} classList={classList()} onClick={onClick}>
            <Show when={props.loading}>
                <div class={common.loader} />
            </Show>
            {props.children}
        </button>
    );
};
