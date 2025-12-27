import { type BaseContent, type BaseOverview } from '@/domain/Base';
import { Inventory } from '@/domain/Inventory';
import { World } from '@/domain/World';
import { createDatafrontTable } from '@/lib/datafront/table';
import {
    BasesTableName,
    type BasesTableRow,
    BasesQueryTypeByLocation,
    type BasesQueryByLocation,
    BaseOverviewsTableName,
    type BaseOverviewsTableRow,
    BaseOverviewsQueryTypeByBranch,
    type BaseOverviewsQueryByBranch,
    BaseOverviewsQueryTypeByCompanyID,
    type BaseOverviewsQueryByCompanyID,
} from '@/lib/net/types.generated';
import { ws } from '@/lib/net/ws';
import { updater, cleaner } from './misc';

export const dfBases = createDatafrontTable<BasesTableRow, BaseContent>({
    name: BasesTableName,
    ws,
    updater,
    cleaner,
    map: (data) => {
        const result: BaseContent = {
            id: data.id,
            worldId: data.worldId,
            tileId: World.makeTileId(data.tileId),
            cityId: data.cityId,

            created: new Date(data.established),
            operator: data.companyId,

            inventory: Inventory.from(data.storage.inventory),
        };

        return result;
    },
});

export const dfBasesByLocation = dfBases.createQuery<BasesQueryByLocation>(BasesQueryTypeByLocation, (p) =>
    [p.worldId, p.tileId].join(':'),
);

export const dfBaseOverviews = createDatafrontTable<BaseOverviewsTableRow, BaseOverview>({
    name: BaseOverviewsTableName,
    ws,
    updater,
    cleaner,
    map: (data): BaseOverview => {
        const result: BaseOverview = {
            id: data.id,
            created: new Date(data.established),
            operator: data.companyId,
            worldId: data.worldId,
            tileId: World.makeTileId(data.tileId),
            cityId: data.cityId,
            areaUsage: 0,
            employment: 0,
            inventoryUsage: 0,
            nFactories: data.nFactories,
        };

        console.log(result);
        return result;
    },
});

export const dfBaseOverviewsByBranch = dfBaseOverviews.createQuery<BaseOverviewsQueryByBranch>(
    BaseOverviewsQueryTypeByBranch,
    (p) => [p.companyId, p.worldId].join(':'),
);
export const dfBaseOverviewsByCompanyId = dfBaseOverviews.createQuery<BaseOverviewsQueryByCompanyID>(
    BaseOverviewsQueryTypeByCompanyID,
    (p) => p.companyId,
);
