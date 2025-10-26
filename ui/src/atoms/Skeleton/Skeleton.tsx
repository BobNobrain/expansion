import { createMemo, type JSX, type Component } from 'solid-js';
import styles from './Skeleton.module.css';

export type SkeletonTextProps = {
    length?: number;
};

export const SkeletonText: Component<SkeletonTextProps> = (props) => {
    const placeholderText = createMemo(() => new Array((props.length ?? 10) + 1).join('+'));

    return <span class={styles.skeletonText}>{placeholderText()}</span>;
};

export type SkeletonBlockProps = {
    width?: number;
    height?: number;
};

export const SkeletonBlock: Component<SkeletonBlockProps> = (props) => {
    const style = createMemo<JSX.CSSProperties>(() => {
        const result: JSX.CSSProperties = {};
        if (props.width !== undefined) {
            result['--skeleton-block-width'] = props.width + 'px';
        }
        if (props.height !== undefined) {
            result['--skeleton-block-height'] = props.height + 'px';
        }
        return result;
    });

    return (
        <div
            class={styles.skeletonBlock}
            classList={{
                [styles.autoWidth]: props.width === undefined,
                [styles.autoHeight]: props.height === undefined,
            }}
            style={style()}
        />
    );
};
