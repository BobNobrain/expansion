import { type Component } from 'solid-js';
import styles from './InlineLoader.module.css';

export type InlineLoaderProps = {
    size?: 's' | 'm' | 'l';
};

export const InlineLoader: Component<InlineLoaderProps> = (props) => {
    return (
        <div class={styles.wrapper} classList={{ [styles[props.size ?? 'm']]: true }}>
            <div class={styles.bar1} />
            <div class={styles.bar2} />
        </div>
    );
};
