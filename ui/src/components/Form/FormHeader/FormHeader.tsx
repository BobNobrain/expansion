import { type ParentComponent } from 'solid-js';
import styles from './FormHeader.module.css';

export const FormHeader: ParentComponent = (props) => {
    return (
        <header class={styles.header}>
            <div class={styles.inner}>{props.children}</div>
        </header>
    );
};
