import { type Component, type JSX } from 'solid-js';
import styles from './TopBar.module.css';

interface TopBarProps {
    left?: JSX.Element[];
    right?: JSX.Element[];
}

export const TopBar: Component<TopBarProps> = (props) => {
    return (
        <aside class={styles.topBar}>
            {props.left?.map((item) => <div class={styles.leftItem}>{item}</div>)}
            <div class={styles.separator}></div>
            {props.right?.map((item) => <div class={styles.rightItem}>{item}</div>)}
        </aside>
    );
};
