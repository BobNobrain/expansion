import { type Component, createMemo, Match, onMount, Show, Switch } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { SceneRenderer } from '../../../components/three/SceneRenderer/SceneRenderer';
import { SectorContentTable } from '../../../components/SectorContentTable/SectorContentTable';
import { WorldInfo } from '../../../components/WorldInfo/WorldInfo';
import { WorldTileInfo } from '../../../components/WorldTileInfo/WorldTileInfo';
import { IconAsteroid, IconFlag, IconPeople, IconPlanet, IconRocks, IconSpaceStation, IconStar } from '../../../icons';
import {
    getExploreRoute,
    WorldContentTab,
    SystemContentTab,
    useExploreRouteInfo,
    getUpperRoute,
} from '../../../routes/explore';
import { PlanetViewScene } from '../../../scenes/PlanetViewScene/PlanetViewScene';
import { SystemMapScene } from '../../../scenes/SystemMapScene/SystemMapScene';
import { GalaxyMapScene } from '../../../scenes/GalaxyMapScene/GalaxyMapScene';
import { TouchCurtain, type TouchCurtainTab } from '../../components/TouchCurtain/TouchCurtain';
import { usePageContextBinding } from '../../components/TouchPage';
import { SystemContentPlanets } from './tabs/SystemContentPlanets';
import { SystemContentStars } from './tabs/SystemContentStars';
import { WorldResources } from '../../../components/WorldResources/WorldResources';

const RedirectToTab: Component<{ tab: string }> = (props) => {
    const navigate = useNavigate();
    const routeInfo = useExploreRouteInfo();
    onMount(() => {
        const info = routeInfo();
        navigate(getExploreRoute({ objectId: info.objectId, tab: props.tab }), { replace: true });
    });
    return null;
};

export const CartographyPage: Component = () => {
    const routeInfo = useExploreRouteInfo();
    const navigate = useNavigate();
    const onOpenSector = (sectorId: string | undefined) => navigate(getExploreRoute({ objectId: sectorId }));

    const backToMain = () => {
        const info = routeInfo();
        navigate(getUpperRoute(info));
    };

    usePageContextBinding(() => {
        const info = routeInfo();
        let title = 'Galaxy Map';
        let subtitle: string | undefined;
        switch (info.objectType) {
            case 'sector':
                title = info.objectId!;
                subtitle = 'Galaxy Map';
                break;

            case 'system':
                title = info.objectId!;
                subtitle = 'System Map';
                break;

            case 'world':
                title = info.objectId!;
                if (info.tileId) {
                    subtitle = `Planetary tile #${info.tileId}`;
                } else {
                    subtitle = 'Planet';
                }
                break;
        }

        return {
            title,
            subtitle,
            goBack: backToMain,
        };
    });

    const tabs = createMemo<TouchCurtainTab[]>(() => {
        const info = routeInfo();

        switch (info.objectType) {
            case 'system':
                return [
                    {
                        icon: IconPlanet,
                        href: getExploreRoute({ objectId: info.objectId, tab: SystemContentTab.Planets }),
                    },
                    {
                        icon: IconSpaceStation,
                        href: getExploreRoute({ objectId: info.objectId, tab: SystemContentTab.Infra }),
                    },
                    {
                        icon: IconAsteroid,
                        href: getExploreRoute({ objectId: info.objectId, tab: SystemContentTab.Asteroids }),
                    },
                    {
                        icon: IconStar,
                        href: getExploreRoute({ objectId: info.objectId, tab: SystemContentTab.Stars }),
                    },
                ];

            case 'world':
                if (info.tileId) {
                    return [];
                }
                return [
                    {
                        icon: IconPlanet,
                        href: getExploreRoute({ objectId: info.objectId, tab: WorldContentTab.Info }),
                    },
                    {
                        icon: IconPeople,
                        href: getExploreRoute({ objectId: info.objectId, tab: WorldContentTab.Population }),
                    },
                    {
                        icon: IconRocks,
                        href: getExploreRoute({ objectId: info.objectId, tab: WorldContentTab.Resources }),
                    },
                    {
                        icon: IconSpaceStation,
                        href: getExploreRoute({ objectId: info.objectId, tab: WorldContentTab.Infra }),
                    },
                    {
                        icon: IconFlag,
                        href: getExploreRoute({ objectId: info.objectId, tab: WorldContentTab.Bases }),
                    },
                ];

            default:
                return [];
        }
    });

    return (
        <>
            <SceneRenderer clearColor="#000000">
                <GalaxyMapScene
                    isActive={routeInfo().objectType === 'galaxy' || routeInfo().objectType === 'sector'}
                    selectedSector={routeInfo().objectId ?? null}
                    onSectorClick={onOpenSector}
                />
                <SystemMapScene isActive={routeInfo().objectType === 'system'} systemId={routeInfo().objectId!} />
                <PlanetViewScene
                    isActive={routeInfo().objectType === 'world'}
                    worldId={routeInfo().objectId!}
                    selectedPlotId={routeInfo().tileId}
                    onPlotSelected={(plot) => {
                        if (!plot) {
                            navigate(getExploreRoute({ objectId: routeInfo().objectId, tab: WorldContentTab.Info }));
                            return;
                        }
                        navigate(getExploreRoute({ objectId: routeInfo().objectId, tab: plot }));
                    }}
                />
            </SceneRenderer>
            <TouchCurtain height={routeInfo().objectType === 'galaxy' ? 's' : 'm'} tabs={tabs()}>
                <Show when={routeInfo().objectType === 'galaxy'}>Galaxy Overview</Show>

                <Show when={routeInfo().objectType === 'sector'}>
                    <SectorContentTable sectorId={routeInfo().objectId!} />
                </Show>

                <Show when={routeInfo().objectType === 'system'}>
                    <Switch fallback={<RedirectToTab tab={SystemContentTab.Planets} />}>
                        <Match when={routeInfo().tab === SystemContentTab.Planets}>
                            <SystemContentPlanets />
                        </Match>
                        <Match when={routeInfo().tab === SystemContentTab.Infra}>No infra yet</Match>
                        <Match when={routeInfo().tab === SystemContentTab.Asteroids}>No asteroids yet</Match>
                        <Match when={routeInfo().tab === SystemContentTab.Stars}>
                            <SystemContentStars />
                        </Match>
                    </Switch>
                </Show>

                <Show when={routeInfo().objectType === 'world'}>
                    <Switch fallback={<WorldTileInfo />}>
                        <Match when={routeInfo().tab === WorldContentTab.Info}>
                            <WorldInfo />
                        </Match>
                        <Match when={routeInfo().tab === WorldContentTab.Population}>Population...</Match>
                        <Match when={routeInfo().tab === WorldContentTab.Resources}>
                            <WorldResources />
                        </Match>
                        <Match when={routeInfo().tab === WorldContentTab.Infra}>Infra...</Match>
                        <Match when={routeInfo().tab === WorldContentTab.Bases}>Bases...</Match>

                        <Match when={!routeInfo().tab && !routeInfo().tileId}>
                            <RedirectToTab tab={WorldContentTab.Info} />
                        </Match>
                    </Switch>
                </Show>
            </TouchCurtain>
        </>
    );
};
