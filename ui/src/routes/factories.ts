import { createMemo } from 'solid-js';
import { useParams } from '@solidjs/router';

const ROUTE_BASE = '/factories';
export type FactoriesRouteParams = { baseId?: string; factoryId?: string; tab?: string };

export type FactoriesRouteInfo = EditFactoryRouteInfo | ViewFactoryRouteInfo;

export type EditFactoryRouteInfo = { factoryId: number; tab: EditFactoryTab };

export enum EditFactoryTab {
    Production = 'production',
    Inventory = 'inventory',
    Workforce = 'workforce',
    Construction = 'construction',
}
const editFactoryTabs: Record<EditFactoryTab, boolean> = {
    [EditFactoryTab.Production]: true,
    [EditFactoryTab.Inventory]: true,
    [EditFactoryTab.Workforce]: true,
    [EditFactoryTab.Construction]: true,
};

export function useEditFactoryRouteInfo(): () => EditFactoryRouteInfo {
    const params = useParams<FactoriesRouteParams>();

    return createMemo((): EditFactoryRouteInfo => {
        return {
            factoryId: Number.parseInt(params.factoryId!),
            tab:
                params.tab && editFactoryTabs[params.tab as EditFactoryTab]
                    ? (params.tab as EditFactoryTab)
                    : EditFactoryTab.Production,
        };
    });
}

export type GetEditFactoryRouteParams = {
    factoryId: number;
    tab?: EditFactoryTab;
};
export function getEditFactoryRoute(params: GetEditFactoryRouteParams): string {
    return [ROUTE_BASE, 'upgrade', params.factoryId.toString(), params.tab ?? EditFactoryTab.Production]
        .filter((x) => x !== undefined)
        .join('/');
}

export type ViewFactoryRouteInfo = { factoryId: number; tab: ViewFactoryTab };
export enum ViewFactoryTab {
    Overview = 'overview',
    Upgrade = 'upgrade',
    Production = 'production',
    Workforce = 'workforce',
}
const viewFactoryTabs: Record<ViewFactoryTab, boolean> = {
    [ViewFactoryTab.Overview]: true,
    [ViewFactoryTab.Upgrade]: true,
    [ViewFactoryTab.Production]: true,
    [ViewFactoryTab.Workforce]: true,
};

export function useViewFactoryRouteInfo(): () => ViewFactoryRouteInfo {
    const params = useParams<FactoriesRouteParams>();

    return createMemo((): ViewFactoryRouteInfo => {
        return {
            factoryId: Number.parseInt(params.factoryId!),
            tab:
                params.tab && viewFactoryTabs[params.tab as ViewFactoryTab]
                    ? (params.tab as ViewFactoryTab)
                    : ViewFactoryTab.Overview,
        };
    });
}

export type GetViewFactoryRouteParams = {
    factoryId: number;
    tab?: ViewFactoryTab;
};
export function getViewFactoryRoute(params: GetViewFactoryRouteParams): string {
    return [ROUTE_BASE, 'view', params.factoryId, params.tab ?? ViewFactoryTab.Overview]
        .filter((x) => x !== undefined)
        .join('/');
}
