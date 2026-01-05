import { createMemo, createSignal, Show, type ParentComponent } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { IconBack, IconContext, IconFlag, IconGalaxy, IconShip, IconUser } from '@/icons';
import { useGoBack } from '@/lib/solid/useGoBack';
import { SidePanelContent } from '@/views/SidePanelContent/SidePanelContent';
import { TouchHeader, TouchHeaderButton, TouchHeaderTitle } from '../TouchHeader/TouchHeader';
import { TouchLoginModal } from '../TouchLoginModal/TouchLoginModal';
import { TouchNavBar, type TouchNavBarItem } from '../TouchNavBar/TouchNavBar';
import { TouchOfflineIndicator } from '../TouchOfflineIndicator/TouchOfflineIndicator';
import { TouchSidePanel } from '../TouchSidePanel/TouchSidePanel';
import { createPageContext, PageContext } from './context';
import { TouchPage } from './TouchPage';

const defaultNavItems: TouchNavBarItem[] = [
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

    const customFooter = createMemo(() => ctx.get().customFooter);

    const { canGoBack, goBack } = useGoBack();

    return (
        <TouchPage
            header={
                <TouchHeader>
                    <TouchHeaderButton
                        onClick={() => {
                            ctx.get().goBack?.(canGoBack() ? goBack : undefined);
                        }}
                    >
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
            footer={
                <Show when={customFooter()} fallback={<TouchNavBar items={defaultNavItems} />}>
                    <Dynamic component={customFooter()} />
                </Show>
            }
        >
            <PageContext.Provider value={ctx}>{props.children}</PageContext.Provider>
            <TouchSidePanel side="right" active={isUserPanelVisible()} onClose={closeUserPanel}>
                <SidePanelContent />
            </TouchSidePanel>
            <TouchLoginModal />
            <TouchOfflineIndicator />
        </TouchPage>
    );
};
