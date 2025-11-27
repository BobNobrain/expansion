import type { ParentComponent } from 'solid-js';
import { normalizePaddingSideValue, type PaddingSide, type PaddingSideNormalized } from '@/lib/appearance';
import styles from './List.module.css';

export type ListProps = {
    striped?: boolean;
};

export const List: ParentComponent<ListProps> = (props) => {
    return (
        <ul
            class={styles.list}
            classList={{
                [styles.striped]: props.striped,
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
