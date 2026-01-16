import { createRouteTemplate, enumParam, stringParam } from './utils';

const ROUTE_BASE = '/bases/transfer';

export enum InventoryTransferTab {
    Selection = 'select',
    Adjustment = 'adjust',
}

export const inventoryTransferRoute = createRouteTemplate(`${ROUTE_BASE}/:location/:tab?`, {
    location: stringParam,
    tab: enumParam([InventoryTransferTab.Selection, InventoryTransferTab.Adjustment]),
});
