import { type Component, createMemo, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { SceneRenderer } from '../../../components/three/SceneRenderer/SceneRenderer';
import { SectorContentTable } from '../../../components/SectorContentTable/SectorContentTable';
import { SystemContentTable } from '../../../components/SystemContentTable/SystemContentTable';
import { IconCity, IconPlanet, IconRocks, IconSpaceStation, IconStar } from '../../../icons';
import { PlanetViewScene } from '../../../scenes/PlanetViewScene/PlanetViewScene';
import { SystemMapScene } from '../../../scenes/SystemMapScene/SystemMapScene';
import { SurfaceInfo } from '../../../components/SurfaceInfo/SurfaceInfo';
import { getExploreRoute, useExploreRouteInfo } from '../../../routes/explore';
import { GalaxyMapScene } from '../../../scenes/GalaxyMapScene/GalaxyMapScene';
import { TouchCurtain, type TouchCurtainTab } from '../../components/TouchCurtain/TouchCurtain';
import { usePageContextBinding } from '../../components/TouchPage';

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
                        href: getExploreRoute({ objectId: info.objectId, tab: 'planets' }),
                    },
                    {
                        icon: IconSpaceStation,
                        href: getExploreRoute({ objectId: info.objectId, tab: 'infra' }),
                    },
                    {
                        icon: IconStar,
                        href: getExploreRoute({ objectId: info.objectId, tab: 'stars' }),
                    },
                ];

            case 'surface':
                return [
                    {
                        icon: IconPlanet,
                        href: getExploreRoute({ objectId: info.objectId, tab: 'info' }),
                    },
                    {
                        icon: IconCity,
                        href: getExploreRoute({ objectId: info.objectId, tab: 'cities' }),
                    },
                    {
                        icon: IconRocks,
                        href: getExploreRoute({ objectId: info.objectId, tab: 'resources' }),
                    },
                ];

            default:
                return [];
        }
    });

    return (
        <>
            <SceneRenderer>
                <GalaxyMapScene
                    isActive={routeInfo().objectType === 'galaxy' || routeInfo().objectType === 'sector'}
                    selectedSector={routeInfo().objectId ?? null}
                    onSectorClick={onOpenSector}
                />
                <SystemMapScene isActive={routeInfo().objectType === 'system'} systemId={routeInfo().objectId!} />
                <PlanetViewScene isActive={routeInfo().objectType === 'surface'} surfaceId={routeInfo().objectId!} />
            </SceneRenderer>
            <TouchCurtain height={routeInfo().objectType === 'galaxy' ? 's' : 'm'} tabs={tabs()}>
                <Show when={routeInfo().objectType === 'galaxy'}>Galaxy Overview</Show>

                <Show when={routeInfo().objectType === 'sector'}>
                    <SectorContentTable sectorId={routeInfo().objectId!} />
                </Show>

                <Show when={routeInfo().objectType === 'system'}>
                    <SystemContentTable systemId={routeInfo().objectId!} />
                </Show>

                <Show when={routeInfo().objectType === 'surface'}>
                    <SurfaceInfo />
                </Show>
            </TouchCurtain>
        </>
    );
};
