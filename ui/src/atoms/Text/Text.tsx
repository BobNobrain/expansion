import { type ParentComponent } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { type SemanticColor } from '@/lib/appearance';
import colors from './colors.module.css';
import sizes from './sizes.module.css';
import styles from './Text.module.css';

export type TextSize = 'h1' | 'h2' | 'h3' | 'large' | 'normal' | 'small';

export type TextProps = {
    color?: SemanticColor | 'dim' | 'bright' | 'default';
    inverted?: boolean;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    size?: TextSize;
    ellipsis?: boolean;

    onClick?: (ev: MouseEvent) => void;
    class?: string;
    tag?: 'span' | 'div';
};

export const Text: ParentComponent<TextProps> = (props) => {
    return (
        <Dynamic
            component={props.tag ?? 'span'}
            class={props.class}
            classList={{
                [styles.text]: true,
                [styles.bold]: props.bold,
                [styles.italic]: props.italic,
                [styles.underline]: props.underline,
                [styles.ellipsis]: props.ellipsis,
                [colors[props.color ?? 'default']]: Boolean(props.color),
                [colors.inverted]: props.inverted,
                [sizes[props.size ?? 'normal']]: Boolean(props.size),
            }}
            onClick={props.onClick}
        >
            {props.children}
        </Dynamic>
    );
};
