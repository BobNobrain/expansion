import { useParams } from '@solidjs/router';
import { createMemo } from 'solid-js';

const ROUTE_BASE = '/bases';
export type BasesRouteParams = { worldId?: string; tileId?: string; tab?: string };

export type TileBaseRouteInfo = {
    worldId: string;
    tileId: string;
    tab: TileBaseTab;
};

export type BasesRouteInfo =
    | {
          worldId?: string;
          tileId?: undefined;
          tab?: undefined;
      }
    | TileBaseRouteInfo;

export enum TileBaseTab {
    Production = 'production',
    ConstructionSites = 'sites',
    Inventory = 'inventory',
    Workers = 'workers',
}

const worldContentTabs: Record<string, true> = {
    [TileBaseTab.Production]: true,
    [TileBaseTab.ConstructionSites]: true,
    [TileBaseTab.Inventory]: true,
    [TileBaseTab.Workers]: true,
};

export function useBasesRouteInfo(): () => BasesRouteInfo {
    const params = useParams<BasesRouteParams>();

    return createMemo((): BasesRouteInfo => {
        return {
            worldId: params.worldId,
            tileId: params.tileId,
            tab: params.tab && worldContentTabs[params.tab] ? (params.tab as TileBaseTab) : undefined,
        } as BasesRouteInfo;
    });
}

export function useTileBaseRouteInfo(): () => TileBaseRouteInfo {
    const routeInfo = useBasesRouteInfo();
    return createMemo<TileBaseRouteInfo>(() => {
        const route = routeInfo();

        if (!route.tileId) {
            throw new Error('useTileBasesRouteInfo: no tileId in URL');
        }

        return route;
    });
}

export type GetBasesRouteParams = {
    worldId?: string;
    tileId?: string;
    tab?: TileBaseTab;
};

export function getBasesRoute(params: GetBasesRouteParams): string {
    const tab = params.tileId ? params.tab ?? TileBaseTab.Production : undefined;

    return [ROUTE_BASE, params.worldId, params.tileId, tab].filter(Boolean).join('/');
}

export function getUpperRoute(info: BasesRouteInfo): string {
    if (info.tileId) {
        return getBasesRoute({ worldId: info.worldId });
    }

    if (info.worldId) {
        return getBasesRoute({});
    }

    return '/';
}
