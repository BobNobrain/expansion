import { createMemo, type Component } from 'solid-js';
import { Container, TabContent, type TabHeader, TabsList } from '@/atoms';
import { IconFlag, IconStorage } from '@/icons';
import { useTileBaseRouteInfo, getBasesRoute, TileBaseTab } from '@/routes/bases';
import { TouchContentSingle } from '@/touch/components/TouchContentSingle/TouchContentSingle';
import { useBasesPageContextBinding } from '../WorldBasesPage/binding';
import { TileBaseInventory } from './tabs/TileBaseInventory';
import { TileBaseOverview } from './tabs/TileBaseOverview';

export const TileBasePage: Component = () => {
    const routeInfo = useTileBaseRouteInfo();

    useBasesPageContextBinding();

    const tabs = createMemo<TabHeader[]>(() => {
        const route = routeInfo();

        return [
            {
                title: 'Overview',
                icon: IconFlag,
                href: getBasesRoute({ ...route, tab: TileBaseTab.Overview }),
            },
            {
                title: 'Inventory',
                icon: IconStorage,
                href: getBasesRoute({ ...route, tab: TileBaseTab.Inventory }),
            },
        ];
    });

    return (
        <TouchContentSingle>
            <TabsList style="pagetop" scrollable tabs={tabs()} />
            <Container padded>
                <TabContent
                    active={routeInfo().tab}
                    components={{
                        [TileBaseTab.Overview]: TileBaseOverview,
                        [TileBaseTab.Inventory]: TileBaseInventory,
                    }}
                />
            </Container>
        </TouchContentSingle>
    );
};
