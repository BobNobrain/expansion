import { createSignal, type Component } from 'solid-js';
import { App } from '../../components/App/App';
import { WindowManagerContext } from '../../components/window/context';
import { WindowManager, type WindowManagerController } from '../../components/window';
import { EditorMenu } from '../components/EditorMenu/EditorMenu';
import styles from './EditorUI.module.css';
import './editor.css';
import { EditorTree } from '../components/EditorTree/EditorTree';
import { Container } from '../../components/Container/Container';
import { EditorPanel } from '../components/EditorPanel/EditorPanel';

export const EditorUI: Component = () => {
    const [getWM, setWM] = createSignal<WindowManagerController | null>(null);

    const [openFilePath, setOpenFilePath] = createSignal<string | null>(null);

    return (
        <App>
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
        </App>
    );
};
