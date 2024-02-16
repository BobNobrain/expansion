import { type ParentProps } from 'solid-js';
import './colors.css';
import './global.css';
import styles from './App.module.css';

export function App(props: ParentProps) {
    return <main class={styles.main}>{props.children}</main>;
}
