import { type Component, type ParentComponent } from 'solid-js';
import styles from './Container.module.css';

export type ContainerProps = {
    padded?: boolean | 'h' | 'v' | 'both';
    hasGap?: boolean;
    size?: 's' | 'm' | 'l';
    direction?: 'row' | 'column';
    threads?: 1 | 2 | 3 | 4 | '1' | '2' | '3' | '4';
    clearSelfPadding?: boolean; // TODO: rename to `inset`?
    stretch?: boolean;
    fullHeight?: boolean;
    wrap?: boolean;
    primaryAlignment?: 'start' | 'end' | 'center';
    secondaryAlignment?: 'start' | 'end' | 'center';
    background?: 'none' | 'light';

    onClick?: (ev: MouseEvent) => void;
};

const SIZE_CLS: Record<NonNullable<ContainerProps['size']>, string> = {
    s: 'sizeS',
    m: 'sizeM',
    l: 'sizeL',
};
const BG_CLS: Record<NonNullable<ContainerProps['background']>, string> = {
    none: styles.bgNone,
    light: styles.bgLight,
};

export const Spacer: Component = () => <div class={styles.spacer} />;

export const Container: ParentComponent<ContainerProps> = (props) => {
    const isFlex = () => props.threads === undefined || props.threads === 1 || props.threads === '1';

    return (
        <div
            class={styles.container}
            classList={{
                [styles.paddedH]: props.padded === true || props.padded === 'both' || props.padded === 'h',
                [styles.paddedV]: props.padded === true || props.padded === 'both' || props.padded === 'v',
                [styles.gap]: props.hasGap,
                [styles[props.direction ?? 'column']]: true,
                [styles.grid]: !isFlex(),
                [styles.flex]: isFlex(),
                [styles[`threads` + (props.threads ?? '1')]]: true,
                [styles.clearSelfPadding]: props.clearSelfPadding,
                [styles[SIZE_CLS[props.size ?? 'm']]]: true,
                [styles.stretch]: props.stretch,
                [styles.fullHeight]: props.fullHeight,
                [styles.wrap]: props.wrap,
                [styles[`primaryAlignmentF${props.primaryAlignment ?? 'start'}`]]: Boolean(props.primaryAlignment),
                [styles[`secondaryAlignmentF${props.secondaryAlignment ?? 'start'}`]]: Boolean(
                    props.secondaryAlignment,
                ),
                [BG_CLS[props.background ?? 'none']]: true,
            }}
            onClick={props.onClick}
        >
            {props.children}
        </div>
    );
};
