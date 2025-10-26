import { type City, WORKFORCE_TYPES, type WorkforceType } from '@/domain/City';
import { World } from '@/domain/World';
import { createDatafrontTable } from '@/lib/datafront/table';
import type { CitiesTableRow, CitiesQueryByWorldID } from '@/lib/net/types.generated';
import { ws } from '@/lib/net/ws';
import { type Predictable, createConstantPredictable } from '@/lib/predictables';
import { updater, cleaner, parsePredictable } from './misc';

export const dfCities = createDatafrontTable<CitiesTableRow, City>({
    name: 'cities',
    ws,
    updater,
    cleaner,
    map: (data) => {
        const result: City = {
            id: data.id,
            worldId: data.world,
            centerTileId: World.makeTileId(data.center),
            claimedTileIds: data.tiles.map(World.makeTileId),

            name: data.name,
            founder: data.founder,
            established: new Date(data.established),
            buildings: data.buildings,
            population: {
                counts: WORKFORCE_TYPES.reduce(
                    (counts, type) => {
                        const opts = data.popCounts[type];
                        if (!opts) {
                            counts[type] = createConstantPredictable(0);
                            return counts;
                        }

                        counts[type] = parsePredictable(opts);
                        return counts;
                    },
                    {} as Record<WorkforceType, Predictable>,
                ),
            },
        };

        return result;
    },
});

export const dfCitiesByWorldId = dfCities.createQuery<CitiesQueryByWorldID>('cities/byWorldId', (p) => p.worldId);
