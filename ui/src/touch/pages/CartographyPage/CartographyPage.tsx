import { type Component, createMemo, Match, onMount, Show, Switch } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { SceneRenderer } from '../../../components/three/SceneRenderer/SceneRenderer';
import { SectorContentTable } from '../../../components/SectorContentTable/SectorContentTable';
import { SurfaceInfo } from '../../../components/SurfaceInfo/SurfaceInfo';
import { IconAsteroid, IconFlag, IconPeople, IconPlanet, IconRocks, IconSpaceStation, IconStar } from '../../../icons';
import { getExploreRoute, SurfaceContentTab, SystemContentTab, useExploreRouteInfo } from '../../../routes/explore';
import { PlanetViewScene } from '../../../scenes/PlanetViewScene/PlanetViewScene';
import { SystemMapScene } from '../../../scenes/SystemMapScene/SystemMapScene';
import { GalaxyMapScene } from '../../../scenes/GalaxyMapScene/GalaxyMapScene';
import { TouchCurtain, type TouchCurtainTab } from '../../components/TouchCurtain/TouchCurtain';
import { usePageContextBinding } from '../../components/TouchPage';
import { SystemContentPlanets } from './tabs/SystemContentPlanets';
import { SystemContentStars } from './tabs/SystemContentStars';

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
        console.log('backToMain', info);
        switch (info.objectType) {
            case 'galaxy':
                navigate('/');
                return;

            case 'sector':
                navigate(getExploreRoute({}));
                return;

            case 'system':
                navigate(getExploreRoute({ objectId: info.objectId!.substring(0, 2) }));
                return;

            case 'surface':
                navigate(getExploreRoute({ objectId: info.objectId!.substring(0, 6) }));
                return;
        }
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

            case 'surface':
                title = info.objectId!;
                subtitle = 'Planet';
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

            case 'surface':
                if (info.plotId) {
                    return [];
                }
                return [
                    {
                        icon: IconPlanet,
                        href: getExploreRoute({ objectId: info.objectId, tab: SurfaceContentTab.Info }),
                    },
                    {
                        icon: IconPeople,
                        href: getExploreRoute({ objectId: info.objectId, tab: SurfaceContentTab.Population }),
                    },
                    {
                        icon: IconRocks,
                        href: getExploreRoute({ objectId: info.objectId, tab: SurfaceContentTab.Resources }),
                    },
                    {
                        icon: IconSpaceStation,
                        href: getExploreRoute({ objectId: info.objectId, tab: SurfaceContentTab.Infra }),
                    },
                    {
                        icon: IconFlag,
                        href: getExploreRoute({ objectId: info.objectId, tab: SurfaceContentTab.Bases }),
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
                    isActive={routeInfo().objectType === 'surface'}
                    surfaceId={routeInfo().objectId!}
                    selectedPlotId={routeInfo().plotId}
                    onPlotSelected={(plot) => {
                        if (!plot) {
                            navigate(getExploreRoute({ objectId: routeInfo().objectId, tab: SurfaceContentTab.Info }));
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

                <Show when={routeInfo().objectType === 'surface'}>
                    <Switch fallback={<div>Plot info: #{routeInfo().plotId}</div>}>
                        <Match when={routeInfo().tab === SurfaceContentTab.Info}>
                            <SurfaceInfo />
                        </Match>
                        <Match when={routeInfo().tab === SurfaceContentTab.Population}>Population...</Match>
                        <Match when={routeInfo().tab === SurfaceContentTab.Resources}>Resources...</Match>
                        <Match when={routeInfo().tab === SurfaceContentTab.Infra}>Infra...</Match>
                        <Match when={routeInfo().tab === SurfaceContentTab.Bases}>Bases...</Match>

                        <Match when={!routeInfo().tab && !routeInfo().plotId}>
                            <RedirectToTab tab={SurfaceContentTab.Info} />
                        </Match>
                    </Switch>
                </Show>
            </TouchCurtain>
        </>
    );
};
