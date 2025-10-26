import { createMemo, type Component } from 'solid-js';
import { type TabHeader, TabsList } from '../../../components/TabsList/TabsList';
import { TabContent } from '../../../components/TabContent/TabContent';
import { IconFactory, IconFence, IconPeople, IconStorage } from '../../../icons';
import { useTileBaseRouteInfo, getBasesRoute, TileBaseTab } from '../../../routes/bases';
import { TileBaseProduction } from './tabs/TileBaseProduction';
import { TileBaseInventory } from './tabs/TileBaseInventory';
import { TileBaseOverview } from './tabs/TileBaseOverview';
import { TouchContentSingle } from '../../components/TouchContentSingle/TouchContentSingle';
import { TileBaseConstructionSites } from './tabs/TileBaseConstructionSites';
import { useBasesPageContextBinding } from '../WorldBasesPage/binding';

export const TileBasePage: Component = () => {
    const routeInfo = useTileBaseRouteInfo();

    useBasesPageContextBinding();

    const tabs = createMemo<TabHeader[]>(() => {
        const route = routeInfo();

        return [
            {
                title: 'Workers',
                icon: IconPeople,
                href: getBasesRoute({ ...route, tab: TileBaseTab.Overview }),
            },
            {
                title: 'Production',
                icon: IconFactory,
                href: getBasesRoute({ ...route, tab: TileBaseTab.Production }),
            },
            {
                title: 'Sites',
                icon: IconFence,
                href: getBasesRoute({ ...route, tab: TileBaseTab.ConstructionSites }),
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
            <TabContent
                active={routeInfo().tab}
                components={{
                    [TileBaseTab.Overview]: TileBaseOverview,
                    [TileBaseTab.Production]: TileBaseProduction,
                    [TileBaseTab.ConstructionSites]: TileBaseConstructionSites,
                    [TileBaseTab.Inventory]: TileBaseInventory,
                }}
            />
        </TouchContentSingle>
    );
};
