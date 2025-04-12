import { type ParentComponent } from 'solid-js';
import styles from './TouchContentSingle.module.css';

export const TouchContentSingle: ParentComponent = (props) => {
    return <main class={styles.single}>{props.children}</main>;
};
