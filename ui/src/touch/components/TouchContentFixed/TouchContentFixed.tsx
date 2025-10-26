import { type ParentComponent } from 'solid-js';
import styles from './TouchContentFixed.module.css';

export const TouchContentFixed: ParentComponent = (props) => {
    return <main class={styles.fixed}>{props.children}</main>;
};
