import { type ParentComponent } from 'solid-js';
import styles from './SceneControls.module.css';

export const SceneControls: ParentComponent = (props) => {
    return <aside class={styles.wrapper}>{props.children}</aside>;
};
