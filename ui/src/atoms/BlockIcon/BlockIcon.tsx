import { createMemo, Show, type Component, type JSX } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { IconTick, type Icon } from '@/icons';
import styles from './BlockIcon.module.css';

export type BlockIconSize = 'sm' | 'md' | 'lg';

export type BlockIconProps = {
    icon: Icon;
    badge?: JSX.Element;
    size?: BlockIconSize;
    checked?: boolean;
    class?: string;
};

const classesBySize: Record<BlockIconSize, string> = {
    sm: styles.sizeSm,
    md: styles.sizeMd,
    lg: styles.sizeLg,
};

export const BlockIcon: Component<BlockIconProps> = (props) => {
    const iconSize = createMemo(() => {
        switch (props.size) {
            case undefined:
            case 'sm':
                return 24;
            case 'md':
                return 32;
            case 'lg':
                return 40;
        }
    });

    return (
        <div
            classList={{
                [styles.icon]: true,
                [classesBySize[props.size ?? 'sm']]: true,
                [props.class ?? '']: Boolean(props.class),
            }}
        >
            <Dynamic component={props.icon} size={iconSize()} block />
            <Show when={props.badge}>
                <div class={styles.badge}>{props.badge}</div>
            </Show>
            <Show when={props.checked}>
                <div class={styles.tick}>
                    <IconTick size={iconSize()} block />
                </div>
            </Show>
        </div>
    );
};
