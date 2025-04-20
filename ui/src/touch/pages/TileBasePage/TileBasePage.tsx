import { createMemo, type Component } from 'solid-js';
import { type TabHeader, TabsList } from '../../../components/TabsList/TabsList';
import { TabContent } from '../../../components/TabContent/TabContent';
import { IconConstruction, IconFactory, IconPeople, IconStorage } from '../../../icons';
import { useTileBaseRouteInfo, getBasesRoute, TileBaseTab } from '../../../routes/bases';
import { TileBaseProduction } from './tabs/TileBaseProduction';
import { TileBaseInventory } from './tabs/TileBaseInventory';
import { TileBaseWorkforce } from './tabs/TileBaseWorkforce';
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
                title: 'Production',
                icon: IconFactory,
                href: getBasesRoute({ ...route, tab: TileBaseTab.Production }),
            },
            {
                title: 'Sites',
                icon: IconConstruction,
                href: getBasesRoute({ ...route, tab: TileBaseTab.ConstructionSites }),
            },
            {
                title: 'Inventory',
                icon: IconStorage,
                href: getBasesRoute({ ...route, tab: TileBaseTab.Inventory }),
            },
            {
                title: 'Workers',
                icon: IconPeople,
                href: getBasesRoute({ ...route, tab: TileBaseTab.Workers }),
            },
        ];
    });

    return (
        <TouchContentSingle>
            <TabsList style="pagetop" scrollable tabs={tabs()} />
            <TabContent
                active={routeInfo().tab}
                components={{
                    [TileBaseTab.Production]: TileBaseProduction,
                    [TileBaseTab.ConstructionSites]: TileBaseConstructionSites,
                    [TileBaseTab.Inventory]: TileBaseInventory,
                    [TileBaseTab.Workers]: TileBaseWorkforce,
                }}
            />
        </TouchContentSingle>
    );
};
