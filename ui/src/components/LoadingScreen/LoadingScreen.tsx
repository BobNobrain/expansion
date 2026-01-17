import type { Component } from 'solid-js';
import styles from './LoadingScreen.module.css';
import { InfoDisplay } from '@/atoms';

export const LoadingScreen: Component = () => {
    return (
        <div class={styles.wrapper}>
            <InfoDisplay title="Connecting">
                <div class={styles.message}>Accessing the network... This can take some time.</div>
            </InfoDisplay>
            <div class={styles.loaders}>
                <div class={styles.loader0} />
                <div class={styles.loader1} />
                <div class={styles.loader2} />
                <div class={styles.loader3} />
                <div class={styles.loader4} />
            </div>
        </div>
    );
};
