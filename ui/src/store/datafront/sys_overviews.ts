import { type StarSystemOverview } from '../../domain/StarSystem';
import { createDatafrontTable } from '../../lib/datafront/table';
import {
    type SysOverviewsQueryByCoords,
    type SysOverviewsQueryBySectorID,
    type SysOverviewsTableRow,
} from '../../lib/net/types.generated';
import { ws } from '../../lib/net/ws';
import { updater, cleaner } from './misc';

export const dfSysOverviews = createDatafrontTable<SysOverviewsTableRow, StarSystemOverview>({
    name: 'sys_overviews',
    ws,
    updater,
    cleaner,
    map: (data) => {
        return {
            id: data.systemId,
            coords: {
                r: data.coordsR,
                h: data.coordsH,
                theta: data.coordsTh,
            },
            isExplored: data.isExplored,
            nAsteroids: data.nAsteroids,
            nPlanets: data.nPlanets,
            stars: data.stars.map((s) => ({
                id: s.starId,
                ageBillionYears: s.ageByrs,
                luminositySuns: s.lumSuns,
                massSuns: s.massSuns,
                radiusAu: s.radiusAu,
                tempK: s.tempK,
            })),
        };
    },
});

export const dfSysOverviewsBySectorId = dfSysOverviews.createQuery<SysOverviewsQueryBySectorID>(
    'sys_overviews/bySectorId',
    (p) => [p.sectorId, p.limit].join(':'),
);

export const dfSysOverviewsByCoords = dfSysOverviews.createQuery<SysOverviewsQueryByCoords>('sys_overviews/byCoords');
