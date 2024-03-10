import { type ParentComponent } from 'solid-js';
import styles from './Container.module.css';

export type ContainerProps = {
    padded?: boolean;
    hasGap?: boolean;
    size?: 's' | 'm' | 'l';
    direction?: 'row' | 'column';
    threads?: 1 | 2 | 3 | 4 | '1' | '2' | '3' | '4';
    clearSelfPadding?: boolean;
};

const SIZE_CLS: Record<NonNullable<ContainerProps['size']>, string> = {
    s: 'sizeS',
    m: 'sizeM',
    l: 'sizeL',
};

export const Container: ParentComponent<ContainerProps> = (props) => {
    const isFlex = () => props.threads === undefined || props.threads === 1 || props.threads === '1';
    return (
        <div
            class={styles.container}
            classList={{
                [styles.padded]: props.padded,
                [styles.gap]: props.hasGap,
                [styles[props.direction ?? 'column']]: true,
                [styles.grid]: !isFlex(),
                [styles.flex]: isFlex(),
                [styles[`threads` + props.threads ?? '1']]: true,
                [styles.clearSelfPadding]: props.clearSelfPadding,
                [styles[SIZE_CLS[props.size ?? 'm']]]: true,
            }}
        >
            {props.children}
        </div>
    );
};
