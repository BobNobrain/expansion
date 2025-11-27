import { useParams } from '@solidjs/router';
import { createMemo } from 'solid-js';

const ROUTE_BASE = '/factories';
export type FactoriesRouteParams = { baseId?: string; factoryId?: string; tab?: string };

export type CreateFactoryRouteInfo = { baseId: number; tab: CreateFactoryTab };
export type ViewFactoryRouteInfo = { factoryId: number };

export type FactoriesRouteInfo = CreateFactoryRouteInfo | ViewFactoryRouteInfo;

export enum CreateFactoryTab {
    Production = 'production',
    Inventory = 'inventory',
    Workforce = 'workforce',
    Construction = 'construction',
}
const createFactoryTabs: Record<CreateFactoryTab, boolean> = {
    [CreateFactoryTab.Production]: true,
    [CreateFactoryTab.Inventory]: true,
    [CreateFactoryTab.Workforce]: true,
    [CreateFactoryTab.Construction]: true,
};

export function useCreateFactoryRouteInfo(): () => CreateFactoryRouteInfo {
    const params = useParams<FactoriesRouteParams>();

    return createMemo((): CreateFactoryRouteInfo => {
        return {
            baseId: Number.parseInt(params.baseId!),
            tab:
                params.tab && createFactoryTabs[params.tab as CreateFactoryTab]
                    ? (params.tab as CreateFactoryTab)
                    : CreateFactoryTab.Production,
        };
    });
}

export function useViewFactoryRouteInfo(): () => ViewFactoryRouteInfo {
    const params = useParams<FactoriesRouteParams>();

    return createMemo((): ViewFactoryRouteInfo => {
        return {
            factoryId: Number.parseInt(params.factoryId!),
        };
    });
}

export type GetCreateFactoryRouteParams = {
    baseId: number;
    tab?: CreateFactoryTab;
};
export function getCreateFactoryRoute(params: GetCreateFactoryRouteParams): string {
    return [ROUTE_BASE, 'create', params.baseId.toString(), params.tab ?? CreateFactoryTab.Production]
        .filter((x) => x !== undefined)
        .join('/');
}

export type GetViewFactoryRouteParams = {
    factoryId: number;
};
export function getViewFactoryRoute(params: GetViewFactoryRouteParams): string {
    return `${ROUTE_BASE}/${params.factoryId}`;
}
