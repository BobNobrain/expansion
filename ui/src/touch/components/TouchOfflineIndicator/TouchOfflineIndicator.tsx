import { type Component } from 'solid-js';
import { ws } from '@/lib/net/ws';
import { useAuth } from '@/store/auth';
import styles from './TouchOfflineIndicator.module.css';

export const TouchOfflineIndicator: Component = () => {
    const { isLoggedIn } = useAuth();
    return (
        <div
            class={styles.wrapper}
            classList={{
                [styles.visible]: isLoggedIn() && !ws.isOnline(),
            }}
        >
            <div class={styles.bar}>Offline, reconnecting...</div>
        </div>
    );
};
