import { type ParentComponent } from 'solid-js';
import styles from './Group.module.css';
import { normalizePaddingSideValue, type PaddingSide, type PaddingSideNormalized } from '@/lib/appearance';

export type GroupProps = {
    style?: 'default' | 'bleak';
    padding?: PaddingSide;
};

const contentPaddingClasses: Record<PaddingSideNormalized, string> = {
    none: styles.contentPaddingNone,
    h: styles.contentPaddingH,
    v: styles.contentPaddingV,
    both: styles.contentPaddingBoth,
};

export const Group: ParentComponent<GroupProps> = (props) => {
    return (
        <div
            class={styles.group}
            classList={{
                [styles[props.style ?? 'default']]: true,
            }}
        >
            <div class={styles.top} />
            <div
                class={styles.content}
                classList={{
                    [contentPaddingClasses[normalizePaddingSideValue(props.padding ?? 'h')]]: true,
                }}
            >
                {props.children}
            </div>
            <div class={styles.bottom} />
        </div>
    );
};

export type GroupHeaderProps = {
    padding?: PaddingSide;
};

const headerPaddingClasses: Record<PaddingSideNormalized, string> = {
    none: styles.contentPaddingNone,
    h: styles.contentPaddingH,
    v: styles.contentPaddingV,
    both: styles.contentPaddingBoth,
};

export const GroupHeader: ParentComponent<GroupHeaderProps> = (props) => {
    return (
        <div
            class={styles.header}
            classList={{
                [headerPaddingClasses[normalizePaddingSideValue(props.padding ?? 'h')]]: true,
            }}
        >
            {props.children}
        </div>
    );
};
