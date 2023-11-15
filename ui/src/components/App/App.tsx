import { ParentProps } from 'solid-js';
import './global.css';
import styles from './App.module.css';

export function App(props: ParentProps) {
    return <main class={styles.main}>{props.children}</main>;
}
