import { type BaseContent } from '../../domain/Base';
import { World } from '../../domain/World';
import { createDatafrontTable } from '../../lib/datafront/table';
import {
    type BasesQueryByBranch,
    type BasesQueryByCompanyID,
    type BasesQueryByLocation,
    BasesQueryTypeByBranch,
    BasesQueryTypeByCompanyID,
    BasesQueryTypeByLocation,
    type BasesTableRow,
} from '../../lib/net/types.generated';
import { ws } from '../../lib/net/ws';
import { updater, cleaner } from './misc';

export const dfBases = createDatafrontTable<BasesTableRow, BaseContent>({
    name: 'bases',
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
            factories: [],
            constructionSites: [],
        };

        return result;
    },
});

export const dfBasesByBranch = dfBases.createQuery<BasesQueryByBranch>('bases/' + BasesQueryTypeByBranch, (p) =>
    [p.companyId, p.worldId].join(':'),
);
export const dfBasesByCompanyId = dfBases.createQuery<BasesQueryByCompanyID>(
    'bases/' + BasesQueryTypeByCompanyID,
    (p) => p.companyId,
);
export const dfBasesByLocation = dfBases.createQuery<BasesQueryByLocation>('bases/' + BasesQueryTypeByLocation, (p) =>
    [p.worldId, p.tileId].join(':'),
);
