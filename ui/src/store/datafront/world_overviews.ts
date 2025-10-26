import { WorldClass, type WorldOverview } from '@/domain/WorldOverview';
import { createDatafrontTable } from '@/lib/datafront/table';
import { type WorldOverviewsQueryBySystemID, type WorldOverviewsTableRow } from '@/lib/net/types.generated';
import { ws } from '@/lib/net/ws';
import { updater, cleaner } from './misc';

export const dfWorldOverviews = createDatafrontTable<WorldOverviewsTableRow, WorldOverview>({
    name: 'world_overviews',
    ws,
    updater,
    cleaner,
    map: (data) => {
        return {
            id: data.worldId,
            params: {
                ageByrs: data.ageByrs ?? 0,
                class: WorldClass.fromString(data.class ?? ''),
                radiusKm: data.radiusKm ?? 0,
                massEarths: data.massEarths ?? 0,
                axisTilt: data.axisTiltRads ?? 0,
                dayLength: data.dayLengthGD ?? 0,
            },
            isExplored: data.isExplored,
            size: data.size ?? 0,
            surface: {
                tempK: data.avgTempK,
                pressureBar: data.surfacePressureBar,
                g: data.g,
            },
            population: {
                bases: data.nBases,
                cities: data.nCities,
                pops: data.nPops,
            },
        };
    },
});

export const dfWorldOverviewsBySystemId = dfWorldOverviews.createQuery<WorldOverviewsQueryBySystemID>(
    'world_overviews/bySystemId',
    (p) => p.systemId,
);
