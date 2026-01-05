import { createRouteTemplate, enumParam, integerParam } from './utils';

const ROUTE_BASE = '/bases/factories';

export enum ViewFactoryTab {
    Overview = 'overview',
    Upgrade = 'upgrade',
    Production = 'production',
    Workforce = 'workforce',
}

export const factoryViewRoute = createRouteTemplate(`${ROUTE_BASE}/view/:factoryId/:tab?`, {
    factoryId: integerParam,
    tab: enumParam([
        ViewFactoryTab.Overview,
        ViewFactoryTab.Production,
        ViewFactoryTab.Upgrade,
        ViewFactoryTab.Workforce,
    ]),
});

export enum EditFactoryTab {
    Production = 'production',
    Inventory = 'inventory',
    Workforce = 'workforce',
    Construction = 'construction',
}

export const factoryEditRoute = createRouteTemplate(`${ROUTE_BASE}/upgrade/:factoryId/:tab?`, {
    factoryId: integerParam,
    tab: enumParam([
        EditFactoryTab.Production,
        EditFactoryTab.Inventory,
        EditFactoryTab.Workforce,
        EditFactoryTab.Construction,
    ]),
});
