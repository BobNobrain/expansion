import { type ParentComponent } from 'solid-js';
import styles from './Group.module.css';

export const Group: ParentComponent = (props) => {
    return (
        <div class={styles.group}>
            <div class={styles.top} />
            <div class={styles.content}>{props.children}</div>
            <div class={styles.bottom} />
        </div>
    );
};

export const GroupHeader: ParentComponent = (props) => {
    return <div class={styles.header}>{props.children}</div>;
};
