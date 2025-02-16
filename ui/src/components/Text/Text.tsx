import { type ParentComponent } from 'solid-js';
import { type SemanticColor } from '../../lib/appearance';
import colors from './colors.module.css';
import sizes from './sizes.module.css';
import styles from './Text.module.css';

export type TextSize = 'h1' | 'h2' | 'h3' | 'normal' | 'small';

export type TextProps = {
    color?: SemanticColor | 'dim' | 'bright' | 'default';
    inverted?: boolean;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    size?: TextSize;
};

export const Text: ParentComponent<TextProps> = (props) => {
    return (
        <span
            class={styles.text}
            classList={{
                [styles.bold]: props.bold,
                [styles.italic]: props.italic,
                [styles.underline]: props.underline,
                [colors[props.color ?? 'default']]: Boolean(props.color),
                [colors.inverted]: props.inverted,
                [sizes[props.size ?? 'normal']]: Boolean(props.size),
            }}
        >
            {props.children}
        </span>
    );
};
