import { type Component, createSignal } from 'solid-js';
import { NavSidebar, type NavSidebarItem } from '../../../components/NavSidebar/NavSidebar';
import { useWindowManager } from '../../../components/window/context';
import { ChatsView } from '../../views/ChatView/ChatsView';

export const DesktopNav: Component = () => {
    const allItems: NavSidebarItem[] = [
        { id: '1', title: 'Screen 1', keybind: 'M' },
        { id: '2', title: 'Screen 2', keybind: 'B' },
        { id: 'chat', title: 'Chat', keybind: 'C' },
    ];

    const [getActiveScreen, setActiveScreen] = createSignal<NavSidebarItem | null>(allItems[0]);
    const wm = useWindowManager();

    const chatWindow = wm()?.createWindow({
        title: { text: 'Chat' },
        attributes: {
            constrainWidth: { min: 400 },
            constrainHeight: { min: 300 },
        },
        content: ChatsView,
    });

    const onActivate = (item: NavSidebarItem) => {
        switch (item.id) {
            case 'chat':
                if (!chatWindow || chatWindow.isOpen()) {
                    return;
                }

                chatWindow.open();
                break;

            default:
                setActiveScreen(item);
                break;
        }
    };

    const getActiveItems = (): NavSidebarItem[] => {
        const activeScreen = getActiveScreen();
        const isChatOpen = chatWindow?.isOpen();

        return allItems.filter((item) => item === activeScreen || (item.id === 'chat' && isChatOpen));
    };

    return <NavSidebar items={allItems} activeItem={getActiveItems()} onActivate={onActivate} />;
};
