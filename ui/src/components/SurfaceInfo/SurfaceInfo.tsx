import { type Component, createEffect } from 'solid-js';
import { useSurfaceOverview } from '../../store/galaxy';
import { useExploreRouteInfo } from '../../routes/explore';

export const SurfaceInfo: Component = () => {
    const routeInfo = useExploreRouteInfo();
    const surface = useSurfaceOverview(() => routeInfo().objectId);

    createEffect(() => {
        console.log('SurfaceInfo', surface);
    });

    return null;
};
