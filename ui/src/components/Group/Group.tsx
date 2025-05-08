import { type ParentComponent } from 'solid-js';
import styles from './Group.module.css';

export type GroupProps = {
    style?: 'default' | 'bleak';
};

export const Group: ParentComponent<GroupProps> = (props) => {
    return (
        <div
            class={styles.group}
            classList={{
                [styles[props.style ?? 'default']]: true,
            }}
        >
            <div class={styles.top} />
            <div class={styles.content}>{props.children}</div>
            <div class={styles.bottom} />
        </div>
    );
};

export const GroupHeader: ParentComponent = (props) => {
    return <div class={styles.header}>{props.children}</div>;
};
