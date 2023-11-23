import { createSignal, type Component } from 'solid-js';
import { App } from '../../../components/App/App';
import { LogInGuard } from '../../../components/LogInGuard';
import { WindowManagerContext } from '../../../components/window/context';
import { WindowManager, type WindowManagerController } from '../../../components/window';
import { PlanetView } from '../../../views/PlanetView/PlanetView';
import { DesktopNav } from '../DesktopNav/DesktopNav';
import { DesktopTopBar } from '../DesktopTopBar/DesktopTopBar';
import styles from './DesktopUI.module.css';
import './desktop.css';

export const DesktopUI: Component = () => {
    const [getWM, setWM] = createSignal<WindowManagerController | null>(null);

    return (
        <App>
            <LogInGuard>
                <WindowManagerContext.Provider value={getWM}>
                    <div class={styles.wrapper}>
                        <DesktopTopBar />
                        <div class={styles.middle}>
                            <div class={styles.main}>
                                <WindowManager mode="static" onController={setWM} />
                                <PlanetView />
                            </div>
                            <div class={styles.nav}>
                                <DesktopNav />
                            </div>
                        </div>
                    </div>
                </WindowManagerContext.Provider>
            </LogInGuard>
        </App>
    );
};
