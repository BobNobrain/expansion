import { createSignal, Show, type ParentComponent } from 'solid-js';
import { createPageContext, PageContext } from './context';
import { TouchPage } from './TouchPage';
import { TouchHeader, TouchHeaderButton, TouchHeaderTitle } from '../TouchHeader/TouchHeader';
import { IconBack, IconContext, IconGalaxy, IconUnknown, IconUser } from '../../../icons';
import { TouchSidePanel } from '../TouchSidePanel/TouchSidePanel';
import { type TouchNavBarItem } from '../TouchNavBar/TouchNavBar';
import { UserFeed } from '../../../components/UserFeed/UserFeed';

const navItems: TouchNavBarItem[] = [
    {
        icon: IconUnknown,
        title: 'Bases',
        href: '/bases',
    },
    {
        icon: IconGalaxy,
        title: 'Explore',
        href: '/galaxy',
    },
    {
        icon: IconUnknown,
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
        </TouchPage>
    );
};
