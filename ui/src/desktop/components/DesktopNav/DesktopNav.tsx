import { type Component } from 'solid-js';
import { NavSidebar, type NavSidebarItem } from '../../../components/NavSidebar/NavSidebar';
import { useWindowManager } from '../../../components/window/context';
import { ChatsView } from '../../views/ChatView/ChatsView';

type DesktopNavProps = {
    screens: NavSidebarItem[];
    activeScreen: NavSidebarItem;
    onActiveSreenUpdate: (newValue: NavSidebarItem) => void;
};

export const DesktopNav: Component<DesktopNavProps> = (props) => {
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
                props.onActiveSreenUpdate(item);
                break;
        }
    };

    const getActiveItems = (): NavSidebarItem[] => {
        const activeScreen = props.activeScreen;
        const isChatOpen = chatWindow?.isOpen();

        return props.screens.filter((item) => item === activeScreen || (item.id === 'chat' && isChatOpen));
    };

    return <NavSidebar items={props.screens} activeItem={getActiveItems()} onActivate={onActivate} />;
};
