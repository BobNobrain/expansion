import { Route } from '@solidjs/router';
import { BasesPage } from '@/touch/pages/BasesPage/BasesPage';
import { CartographyPage } from '@/touch/pages/CartographyPage/CartographyPage';
import { CompanyPage } from '@/touch/pages/CompanyPage/CompanyPage';
import { EditFactoryPage, ViewFactoryPage } from '@/touch/pages/FactoryPage';
import { InventoryTransferPage } from '@/touch/pages/InventoryTransferPage/InventoryTransferPage';
import { SetupPage } from '@/touch/pages/SetupPage/SetupPage';
import { TileBasePage } from '@/touch/pages/TileBasePage/TileBasePage';
import { WorldBasesPage } from '@/touch/pages/WorldBasesPage/WorldBasesPage';
import { UserPage } from '@/touch/pages/UserPage/UserPage';
import { BASES_ALL_ROUTE_TEMPLATE, BASES_TILE_ROUTE_TEMPLATE, BASES_WORLD_ROUTE_TEMPLATE } from './bases';
import { EXPLORE_ROUTE_TEMPLATE } from './explore';
import { factoryEditRoute, factoryViewRoute } from './factories';
import { companyRoute, userRoute } from './misc';
import { setupRoute } from './setup';
import { inventoryTransferRoute } from './transfer';

export function basesRouteDefs() {
    return (
        <>
            <Route path={BASES_ALL_ROUTE_TEMPLATE} component={BasesPage} />
            <Route path={BASES_WORLD_ROUTE_TEMPLATE} component={WorldBasesPage} />
            <Route path={BASES_TILE_ROUTE_TEMPLATE} component={TileBasePage} />
        </>
    );
}

export function factoryRouteDefs() {
    return (
        <>
            <Route path={factoryViewRoute.template} component={ViewFactoryPage} />
            <Route path={factoryEditRoute.template} component={EditFactoryPage} />
        </>
    );
}

export function inventoryRouteDefs() {
    return <Route path={inventoryTransferRoute.template} component={InventoryTransferPage} />;
}

export function exploreRouteDefs() {
    return <Route path={EXPLORE_ROUTE_TEMPLATE} component={CartographyPage} />;
}

export function userRouteDefs() {
    return <Route path={userRoute.template} component={UserPage} />;
}

export function companyRouteDefs() {
    return <Route path={companyRoute.template} component={CompanyPage} />;
}

export function setupRouteDefs() {
    return <Route path={setupRoute.template} component={SetupPage} />;
}
