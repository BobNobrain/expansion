import { useParams } from '@solidjs/router';
import { createMemo } from 'solid-js';

const ROUTE_BASE = '/galaxy';
export const EXPLORE_ROUTE_TEMPLATE = `${ROUTE_BASE}/:id?/:tab?`;
export type ExploreRouteParams = { id?: string; tab?: string };

export type ExploreObjectType = 'galaxy' | 'sector' | 'system' | 'world';

export type ExploreRouteInfo = {
    objectId?: string;
    objectType: ExploreObjectType;
    tab?: string;
    tileId?: string;
};

export enum SystemContentTab {
    Planets = 'planets',
    Infra = 'infra',
    Asteroids = 'asteroids',
    Stars = 'stars',
}

export enum WorldContentTab {
    Info = 'info',
    Population = 'population',
    Resources = 'resources',
    Infra = 'infra',
    Bases = 'bases',
}

const worldContentTabs: Record<string, true> = {
    [WorldContentTab.Info]: true,
    [WorldContentTab.Population]: true,
    [WorldContentTab.Resources]: true,
    [WorldContentTab.Infra]: true,
    [WorldContentTab.Bases]: true,
};

export function useExploreRouteInfo(): () => ExploreRouteInfo {
    const params = useParams<ExploreRouteParams>();

    return createMemo((): ExploreRouteInfo => {
        const result: ExploreRouteInfo = {
            objectId: params.id,
            objectType: 'galaxy',
            tab: params.tab,
            tileId: undefined,
        };

        const id = params.id;
        if (id) {
            if (id.length === 2) {
                result.objectType = 'sector';
            } else if (id.length === 6) {
                result.objectType = 'system';
            } else {
                result.objectType = 'world';
            }
        }

        if (result.objectType === 'world' && result.tab && !worldContentTabs[result.tab]) {
            result.tab = undefined;
            result.tileId = params.tab;
        }

        return result;
    });
}

export type GetExploreRouteParams = {
    objectId?: string;
    tab?: string;
};

export function getExploreRoute(params: GetExploreRouteParams): string {
    return [ROUTE_BASE, params.objectId, params.tab].filter(Boolean).join('/');
}

export function useExploreRouteObjectId(type: ExploreObjectType): () => string | null {
    const routeInfo = useExploreRouteInfo();
    return () => {
        const { objectType, objectId } = routeInfo();
        return objectType === type ? objectId ?? null : null;
    };
}

export function getUpperRoute(info: ExploreRouteInfo): string {
    switch (info.objectType) {
        case 'galaxy':
            return '/';

        case 'sector':
            return getExploreRoute({});

        case 'system':
            return getExploreRoute({ objectId: info.objectId!.substring(0, 2) });

        case 'world':
            if (info.tileId) {
                return getExploreRoute({ objectId: info.objectId, tab: WorldContentTab.Info });
            }

            return getExploreRoute({ objectId: info.objectId!.substring(0, 6) });
    }
}
