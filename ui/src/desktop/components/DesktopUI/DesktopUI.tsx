import { createSignal, type Component } from 'solid-js';
import { App } from '../../../components/App/App';
import { type NavSidebarItem } from '../../../components/NavSidebar/NavSidebar';
import { LogInGuard } from '../../../components/LogInGuard';
import { WindowManagerContext } from '../../../components/window/context';
import { WindowManager, type WindowManagerController } from '../../../components/window';
import { DesktopNav } from '../DesktopNav/DesktopNav';
import { DesktopTopBar } from '../DesktopTopBar/DesktopTopBar';
import styles from './DesktopUI.module.css';
import './desktop.css';

export const DesktopUI: Component = () => {
    const [getWM, setWM] = createSignal<WindowManagerController | null>(null);

    const allItems: NavSidebarItem[] = [
        { id: '1', title: 'Screen 1', keybind: 'M' },
        { id: '2', title: 'Screen 2', keybind: 'B' },
        { id: 'chat', title: 'Chat', keybind: 'C' },
    ];

    const [getActiveScreen, setActiveScreen] = createSignal<NavSidebarItem>(allItems[1]);

    return (
        <App>
            <LogInGuard>
                <WindowManagerContext.Provider value={getWM}>
                    <div class={styles.wrapper}>
                        <DesktopTopBar />
                        <div class={styles.middle}>
                            <div class={styles.main}>
                                <WindowManager mode="static" onController={setWM} />
                            </div>
                            <div class={styles.nav}>
                                <DesktopNav
                                    screens={allItems}
                                    activeScreen={getActiveScreen()}
                                    onActiveSreenUpdate={setActiveScreen}
                                />
                            </div>
                        </div>
                    </div>
                </WindowManagerContext.Provider>
            </LogInGuard>
        </App>
    );
};
