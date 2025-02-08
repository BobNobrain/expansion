import { createSignal, Show, type ParentComponent } from 'solid-js';
import { UserFeed } from '../../../components/UserFeed/UserFeed';
import { IconBack, IconContext, IconFlag, IconGalaxy, IconShip, IconUser } from '../../../icons';
import { TouchHeader, TouchHeaderButton, TouchHeaderTitle } from '../TouchHeader/TouchHeader';
import { TouchLoginModal } from '../TouchLoginModal/TouchLoginModal';
import { type TouchNavBarItem } from '../TouchNavBar/TouchNavBar';
import { TouchOfflineIndicator } from '../TouchOfflineIndicator/TouchOfflineIndicator';
import { TouchSidePanel } from '../TouchSidePanel/TouchSidePanel';
import { createPageContext, PageContext } from './context';
import { TouchPage } from './TouchPage';

const navItems: TouchNavBarItem[] = [
    {
        icon: IconFlag,
        title: 'Bases',
        href: '/bases',
    },
    {
        icon: IconGalaxy,
        title: 'Explore',
        href: '/galaxy',
    },
    {
        icon: IconShip,
        title: 'Fleet',
        href: '/fleet',
    },
    {
        icon: IconContext,
        title: 'More',
        href: '/moar',
    },
];

export const TouchPageWrapper: ParentComponent = (props) => {
    const ctx = createPageContext();
    const [isUserPanelVisible, setUserPanelVisible] = createSignal(false);
    const closeUserPanel = () => setUserPanelVisible(false);
    const openUserPanel = () => setUserPanelVisible(true);

    return (
        <TouchPage
            stretch
            header={
                <TouchHeader>
                    <TouchHeaderButton onClick={ctx.get().goBack}>
                        <Show when={ctx.get().goBack} fallback={<IconGalaxy size={32} />}>
                            <IconBack size={20} />
                        </Show>
                    </TouchHeaderButton>
                    <TouchHeaderTitle title={ctx.get().title} subtitle={ctx.get().subtitle} />
                    <Show when={ctx.get().related.length}>
                        <TouchHeaderButton onClick={() => {}}>
                            <IconContext size={32} />
                        </TouchHeaderButton>
                    </Show>
                    <TouchHeaderButton onClick={openUserPanel}>
                        <IconUser size={32} />
                    </TouchHeaderButton>
                </TouchHeader>
            }
            footerItems={navItems}
        >
            <PageContext.Provider value={ctx}>{props.children}</PageContext.Provider>
            <TouchSidePanel side="right" active={isUserPanelVisible()} onClose={closeUserPanel}>
                <UserFeed />
            </TouchSidePanel>
            <TouchLoginModal />
            <TouchOfflineIndicator />
        </TouchPage>
    );
};
