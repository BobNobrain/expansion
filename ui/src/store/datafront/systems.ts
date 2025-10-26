import { mapValues } from 'lodash';
import { type Orbit } from '@/domain/Orbit';
import { type Star } from '@/domain/Star';
import { type StarSystemContent } from '@/domain/StarSystem';
import { ExplorationData } from '@/domain/misc';
import { createDatafrontTable } from '@/lib/datafront/table';
import { type SystemsTableRow } from '@/lib/net/types.generated';
import { ws } from '@/lib/net/ws';
import { updater, cleaner } from './misc';

export const dfSystems = createDatafrontTable<SystemsTableRow, StarSystemContent>({
    name: 'systems',
    ws,
    updater,
    cleaner,
    map: (data) => {
        return {
            id: data.systemId,
            explored: ExplorationData.parse(data),
            orbits: mapValues(
                data.orbits ?? {},
                (orbit, bodyId): Orbit => ({
                    bodyId,
                    aroundId: orbit.around,
                    eccentricity: orbit.ecc,
                    inclination: orbit.incl,
                    rotation: orbit.rot,
                    semiMajorAu: orbit.semiMajorAu,
                    timeAtPeriapsis: new Date(orbit.t0),
                }),
            ),
            stars: Object.values(data.stars ?? {}).map(
                (s): Star => ({
                    id: s.starId,
                    ageBillionYears: s.ageByrs,
                    luminositySuns: s.lumSuns,
                    massSuns: s.massSuns,
                    radiusAu: s.radiusAu,
                    tempK: s.tempK,
                }),
            ),
        };
    },
});
