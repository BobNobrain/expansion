import { onMount, type ParentProps } from 'solid-js';
import { useAuth } from '../../store/auth';
import './colors.css';
import './global.css';
import styles from './App.module.css';

export function App(props: ParentProps) {
    const { connect: tryInitialAuth } = useAuth();
    onMount(() => {
        tryInitialAuth();
    });

    return <div class={styles.main}>{props.children}</div>;
}
