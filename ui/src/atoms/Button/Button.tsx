import { type ParentProps, type Component, Show, createMemo } from 'solid-js';
import { type SemanticColor } from '@/lib/appearance';
import common from './Button.module.css';
import lightStyleColors from './light.module.css';
import solidStyleColors from './solid.module.css';
import textStyleColors from './text.module.css';

export type ButtonStyle = 'solid' | 'text' | 'light';
export type ButtonSize = 's' | 'm' | 'l' | 'text';

export type ButtonProps = ParentProps & {
    color?: SemanticColor;
    style?: ButtonStyle;
    size?: ButtonSize;
    square?: boolean;
    compact?: boolean;

    disabled?: boolean;
    loading?: boolean;

    stopPropagation?: boolean;
    onClick?: (ev: MouseEvent) => void;
    type?: 'button' | 'submit'; // TODO: add 'link'?
};

const sizeClasses: Record<ButtonSize, string> = {
    text: common.sizeText,
    s: common.sizeS,
    m: common.sizeM,
    l: common.sizeL,
};

export const Button: Component<ButtonProps> = (props) => {
    const onClick = (ev: MouseEvent) => {
        if (props.loading || props.disabled) {
            ev.preventDefault();
            return;
        }

        props.onClick?.(ev);

        if (props.stopPropagation) {
            ev.stopPropagation();
        }
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

            case 'light':
                colorClassName = lightStyleColors[color];
        }

        return {
            [colorClassName]: !props.disabled,
            [sizeClasses[size]]: true,
            [common.square]: props.square,
            [common[style]]: true,
            [common.compact]: props.compact,
            [common.disabled]: props.disabled,
            [common.loading]: props.loading && !props.disabled,
        };
    });

    return (
        <button
            class={common.button}
            classList={classList()}
            onClick={onClick}
            type={props.type ?? 'button'}
            disabled={props.disabled || props.loading}
        >
            <Show when={props.loading}>
                <div class={common.loader} />
            </Show>
            {props.children}
        </button>
    );
};
