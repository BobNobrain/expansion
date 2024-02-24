import { type Component, type JSX, createMemo } from 'solid-js';
import { type SemanticColor } from '../../lib/appearance';
import styles from './icon.module.css';
import colors from './colors.module.css';

export type IconProps = {
    color?: SemanticColor | 'text' | 'inherit';
    size?: number;
    rotate?: number;
    flipHorizontally?: boolean;
    flipVertically?: boolean;
};

export type IconifyOptions = {
    viewBox: string;
    content: () => JSX.Element | JSX.Element[];
};

export function iconify({ viewBox, content }: IconifyOptions): Component<IconProps> {
    return (props) => {
        const sizePx = createMemo(() => `${props.size ?? 16}px`);

        const css = createMemo<JSX.CSSProperties | undefined>(() => {
            const transforms: string[] = [];

            if (props.rotate) {
                transforms.push(`rotate(${props.rotate}deg)`);
            }
            if (props.flipHorizontally || props.flipVertically) {
                transforms.push(`scale(${props.flipHorizontally ? '-1' : '1'}, ${props.flipVertically ? '-1' : 1})`);
            }

            if (!transforms.length) {
                return undefined;
            }

            return {
                transform: transforms.join(' '),
            };
        });

        return (
            <svg
                width={sizePx()}
                height={sizePx()}
                viewBox={viewBox}
                class={styles.icon}
                classList={{
                    [colors[props.color ?? 'text']]: true,
                }}
                style={css()}
            >
                {content()}
            </svg>
        );
    };
}
