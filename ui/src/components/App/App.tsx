import { type ParentProps } from 'solid-js';
import './colors.css';
import './global.css';
import styles from './App.module.css';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 2, // 2 hours
        },
    },
});

export function App(props: ParentProps) {
    return (
        <div class={styles.main}>
            <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
        </div>
    );
}
