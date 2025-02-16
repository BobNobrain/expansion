import { ExplorationData } from '../../domain/misc';
import { type World } from '../../domain/World';
import { WorldClass } from '../../domain/WorldOverview';
import { createDatafrontTable } from '../../lib/datafront/table';
import { type WorldsTableRow } from '../../lib/net/types.generated';
import { ws } from '../../lib/net/ws';
import { updater, cleaner } from './misc';

export const dfWorlds = createDatafrontTable<WorldsTableRow, World>({
    name: 'worlds',
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
            explored: ExplorationData.parse(data),

            grid: {
                coords: data.gridCoords ?? [],
                edges: data.gridEdges ?? [],
            },
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

            elevationsScaleKm: data.elevationsScaleKm,
            elevations: data.elevations ?? [],
            biomes: data.surfaceTypes ?? [],
            colors: (data.colors ?? []).map(([r, g, b]) => ({ r, g, b })),
            oceanLevel: data.oceansLevel,

            atmosphere: data.atmosphere ?? {},
            oceans: data.oceans ?? {},
            snow: data.snow ?? {},
        };
    },
});
