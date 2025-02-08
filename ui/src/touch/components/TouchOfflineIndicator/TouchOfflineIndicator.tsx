import { type Component } from 'solid-js';
import styles from './TouchOfflineIndicator.module.css';
import { useAuth } from '../../../store/auth';
import { ws } from '../../../lib/net/ws';

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
