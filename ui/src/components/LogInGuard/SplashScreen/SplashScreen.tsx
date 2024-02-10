import { type Component } from 'solid-js';
import styles from './SplashScreen.module.css';

export const SplashScreen: Component = () => {
    return (
        <div class={styles.splash}>
            <div class={styles.label}>Initializing...</div>
        </div>
    );
};
