import { GalacticGrid, type GalacticOverview } from '../../domain/GalacticOverview';
import { createDatafrontSingleton } from '../../lib/datafront/singleton';
import { type DFGalaxyValue } from '../../lib/net/types.generated';
import { ws } from '../../lib/net/ws';
import { updater } from './misc';

export const dfGalaxy = createDatafrontSingleton<DFGalaxyValue, GalacticOverview>({
    name: 'galaxy',
    ws,
    updater,
    map: (data) => {
        return {
            grid: new GalacticGrid({
                innerR: data.innerR,
                outerR: data.outerR,
                maxH: data.maxH,
                sectors: (data.sectors ?? []).map(({ innerR, outerR, sectorId, thetaEnd, thetaStart }) => ({
                    id: sectorId,
                    innerR,
                    outerR,
                    thetaEnd,
                    thetaStart,
                })),
            }),
            labels: [],
            landmarks: [],
        };
    },
});
