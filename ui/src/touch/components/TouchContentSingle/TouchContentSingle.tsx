import { type ParentComponent } from 'solid-js';
import styles from './TouchContentSingle.module.css';

export type TouchContentSingleProps = {
    fullHeight?: boolean;
};

export const TouchContentSingle: ParentComponent<TouchContentSingleProps> = (props) => {
    return (
        <main class={styles.single} classList={{ [styles.fullHeight]: props.fullHeight }}>
            {props.children}
        </main>
    );
};
