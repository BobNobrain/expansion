import { createMemo, type Component } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { type TabHeader, TabsList } from '../../../components/TabsList/TabsList';
import { TabContent } from '../../../components/TabContent/TabContent';
import { usePageContextBinding } from '../../components/TouchPage';
import { IconFactory, IconPeople, IconStorage } from '../../../icons';
import { useTileBaseRouteInfo, getBasesRoute, TileBaseTab, getUpperRoute } from '../../../routes/bases';
import { TileBaseProduction } from './tabs/TileBaseProduction';
import { TileBaseInventory } from './tabs/TileBaseInventory';
import { TileBaseWorkforce } from './tabs/TileBaseWorkforce';
import { TouchContentSingle } from '../../components/TouchContentSingle/TouchContentSingle';

export const TileBasePage: Component = () => {
    const routeInfo = useTileBaseRouteInfo();
    const navigate = useNavigate();

    const goBack = () => navigate(getUpperRoute(routeInfo()));

    usePageContextBinding(() => {
        const info = routeInfo();
        let title = 'All Bases';
        let subtitle: string | undefined;

        if (info.tileId) {
            title = 'Base';
            subtitle = `${info.worldId}#${info.tileId}`;
        } else if (info.worldId) {
            title = `World Bases`;
            subtitle = info.worldId;
        }

        return {
            title,
            subtitle,
            goBack,
        };
    });

    const tabs = createMemo<TabHeader[]>(() => {
        const route = routeInfo();

        return [
            {
                title: 'Production',
                icon: IconFactory,
                href: getBasesRoute({ ...route, tab: TileBaseTab.Production }),
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
                    [TileBaseTab.Inventory]: TileBaseInventory,
                    [TileBaseTab.Workers]: TileBaseWorkforce,
                }}
            />
        </TouchContentSingle>
    );
};
