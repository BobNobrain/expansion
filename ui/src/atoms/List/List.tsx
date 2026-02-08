import { Show, type Component, type JSX, type ParentComponent } from 'solid-js';
import { normalizePaddingSideValue, type PaddingSide, type PaddingSideNormalized } from '@/lib/appearance';
import styles from './List.module.css';
import type { Icon } from '@/icons';
import { Dynamic } from 'solid-js/web';
import { Text } from '../Text/Text';

export type ListProps = {
    striped?: boolean;
    inset?: boolean;
};

export const List: ParentComponent<ListProps> = (props) => {
    return (
        <ul
            class={styles.list}
            classList={{
                [styles.striped]: props.striped,
                [styles.inset]: props.inset,
            }}
        >
            {props.children}
        </ul>
    );
};

export type ListItemProps = {
    selected?: boolean;
    padded?: PaddingSide;
    onClick?: (ev: MouseEvent) => void;
};

const paddingStyles: Record<PaddingSideNormalized, string> = {
    none: styles.paddingNone,
    h: styles.paddingH,
    v: styles.paddingV,
    both: styles.paddingBoth,
};

export const ListItem: ParentComponent<ListItemProps> = (props) => {
    return (
        <li
            class={styles.item}
            classList={{
                [styles.selected]: props.selected,
                [styles.clickable]: Boolean(props.onClick),
                [paddingStyles[normalizePaddingSideValue(props.padded ?? 'both')]]: true,
            }}
            onClick={props.onClick}
        >
            {props.children}
        </li>
    );
};

export type ListItemContentProps = {
    title: JSX.Element;
    icon?: Icon;
    subtitle?: JSX.Element;
    actions?: JSX.Element;
};

export const ListItemContent: Component<ListItemContentProps> = (props) => {
    return (
        <div class={styles.content}>
            <Show when={props.icon}>
                <div class={styles.iconWrapper}>
                    <Dynamic component={props.icon} size={32} block />
                </div>
            </Show>
            <div class={styles.contentMain}>
                <Text size="h2" class={styles.contentTitle} tag="div">
                    {props.title}
                </Text>
                <Show when={props.subtitle}>
                    <Text class={styles.contentSubtitle} tag="div">
                        {props.subtitle}
                    </Text>
                </Show>
            </div>
            <Show when={props.actions}>
                <div class={styles.actions}>{props.actions}</div>
            </Show>
        </div>
    );
};
