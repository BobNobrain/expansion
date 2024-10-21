import { type Component, Show } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { SceneRenderer } from '../../../components/three/SceneRenderer/SceneRenderer';
import { GalaxyMapScene } from '../../../scenes/GalaxyMapScene/GalaxyMapScene';
import { TouchCurtain } from '../../components/TouchCurtain/TouchCurtain';
import { SectorContentTable } from '../../../components/SectorContentTable/SectorContentTable';
import { SystemMapScene } from '../../../scenes/SystemMapScene/SystemMapScene';
import { SystemContentTable } from '../../../components/SystemContentTable/SystemContentTable';
import { usePageContextBinding } from '../../components/TouchPage';
import { getExploreRoute, useExploreRouteInfo } from '../../../routes/explore';

export const CartographyPage: Component = () => {
    const routeInfo = useExploreRouteInfo();
    const navigate = useNavigate();
    const onOpenSector = (sectorId: string | undefined) => navigate(getExploreRoute({ objectId: sectorId }));

    const backToMain = () => {
        const info = routeInfo();
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
                navigate(getExploreRoute({ objectId: info.objectId!.substring(0, 7) }));
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

    return (
        <>
            <SceneRenderer>
                <GalaxyMapScene
                    isActive={routeInfo().objectType === 'galaxy' || routeInfo().objectType === 'sector'}
                    selectedSector={routeInfo().objectId ?? null}
                    onSectorClick={onOpenSector}
                />
                <SystemMapScene isActive={routeInfo().objectType === 'system'} systemId={routeInfo().objectId!} />
            </SceneRenderer>
            <TouchCurtain height={routeInfo().objectType === 'galaxy' ? 's' : 'm'}>
                <Show when={routeInfo().objectType === 'galaxy'}>Galaxy Overview</Show>

                <Show when={routeInfo().objectType === 'sector'}>
                    <SectorContentTable sectorId={routeInfo().objectId!} />
                </Show>

                <Show when={routeInfo().objectType === 'system'}>
                    <SystemContentTable systemId={routeInfo().objectId!} />
                </Show>

                <Show when={routeInfo().objectType === 'surface'}>Planet overview</Show>
            </TouchCurtain>
        </>
    );
};
