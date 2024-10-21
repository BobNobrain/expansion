import { useParams } from '@solidjs/router';
import { createMemo } from 'solid-js';

const ROUTE_BASE = '/galaxy';
export const EXPLORE_ROUTE_DEFINITION = `${ROUTE_BASE}/:id?/:tab?`;
export type ExploreRouteParams = { id?: string; tab?: string };

export type ExploreObjectType = 'galaxy' | 'sector' | 'system' | 'surface';

export type ExploreRouteInfo = {
    objectId?: string;
    objectType: ExploreObjectType;
    tab?: string;
};

export function useExploreRouteInfo(): () => ExploreRouteInfo {
    const params = useParams<ExploreRouteParams>();

    return createMemo((): ExploreRouteInfo => {
        const result: ExploreRouteInfo = {
            objectId: params.id,
            objectType: 'galaxy',
            tab: params.tab,
        };

        const id = params.id;
        if (id) {
            if (id.length === 2) {
                result.objectType = 'sector';
            } else if (id.length === 6) {
                result.objectType = 'system';
            } else {
                result.objectType = 'surface';
            }
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
