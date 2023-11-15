import { type Component, type ParentProps } from 'solid-js';
import styles from './FormActions.module.css';

export const FormActions: Component<ParentProps> = (props) => {
    return <div class={styles.actions}>{props.children}</div>;
};
