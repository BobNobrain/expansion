import { onMount, type ParentProps } from 'solid-js';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { useAuth } from '../../store/auth';
import './colors.css';
import './global.css';
import styles from './App.module.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 2, // 2 hours
        },
    },
});

export function App(props: ParentProps) {
    const { connect: tryInitialAuth } = useAuth();
    onMount(() => {
        tryInitialAuth();
    });

    return (
        <div class={styles.main}>
            <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>
        </div>
    );
}
