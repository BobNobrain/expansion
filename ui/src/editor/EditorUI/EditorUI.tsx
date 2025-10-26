import { createSignal, type Component } from 'solid-js';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { App } from '../../components/App/App';
import { Container } from '../../atoms/Container/Container';
import { EditorMenu } from '../components/EditorMenu/EditorMenu';
import { EditorPanel } from '../components/EditorPanel/EditorPanel';
import { EditorTree } from '../components/EditorTree/EditorTree';
import { WindowManagerContext } from '../../components/window/context';
import { WindowManager, type WindowManagerController } from '../../components/window';
import styles from './EditorUI.module.css';
import './editor.css';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            gcTime: 1000 * 60 * 60 * 2, // 2 hours
        },
    },
});

export const EditorUI: Component = () => {
    const [getWM, setWM] = createSignal<WindowManagerController | null>(null);

    const [openFilePath, setOpenFilePath] = createSignal<string | null>(null);

    return (
        <App>
            <QueryClientProvider client={queryClient}>
                <WindowManagerContext.Provider value={getWM}>
                    <div class={styles.wrapper}>
                        <EditorMenu />
                        <Container direction="row" stretch>
                            <div class={styles.sidebar}>
                                <EditorTree activeFullPath={openFilePath()} onOpen={setOpenFilePath} />
                            </div>
                            <div class={styles.main}>
                                <WindowManager mode="static" onController={setWM} />
                                <EditorPanel activePath={openFilePath()} />
                            </div>
                        </Container>
                    </div>
                </WindowManagerContext.Provider>
            </QueryClientProvider>
        </App>
    );
};
