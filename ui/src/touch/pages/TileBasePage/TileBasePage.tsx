import { createMemo, type Component } from 'solid-js';
import { TabContent, type TabHeader, TabsList } from '@/atoms';
import { IconFlag, IconStorage } from '@/icons';
import { useTileBaseRouteInfo, getBasesRoute, TileBaseTab } from '@/routes/bases';
import { TouchContentSingle } from '@/touch/components/TouchContentSingle/TouchContentSingle';
import { useBasesPageContextBinding } from '../WorldBasesPage/binding';
// import { TileBaseFactories } from './tabs/TileBaseFactories';
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
            // {
            //     title: 'Production',
            //     icon: IconFactory,
            //     href: getBasesRoute({ ...route, tab: TileBaseTab.Factories }),
            // },
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
            <TabContent
                active={routeInfo().tab}
                components={{
                    [TileBaseTab.Overview]: TileBaseOverview,
                    // [TileBaseTab.Factories]: TileBaseFactories,
                    [TileBaseTab.Inventory]: TileBaseInventory,
                }}
            />
        </TouchContentSingle>
    );
};
