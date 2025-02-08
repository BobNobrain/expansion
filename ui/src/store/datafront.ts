import { mapValues } from 'lodash';
import { GalacticGrid, type GalacticOverview } from '../domain/GalacticOverview';
import { type Orbit } from '../domain/Orbit';
import { type Star } from '../domain/Star';
import { type StarSystemContent, type StarSystemOverview } from '../domain/StarSystem';
import { type World } from '../domain/World';
import { type WorldOverview, WorldClass } from '../domain/WorldOverview';
import { type User, type CurrentUserData } from '../domain/User';
import { ExplorationData } from '../domain/misc';
import { createDatafrontSingleton } from '../lib/datafront/singleton';
import { createDatafrontTable } from '../lib/datafront/table';
import { createDatafrontUpdater } from '../lib/datafront/updater';
import {
    type UsersQueryByIDPayload,
    type UsersQueryByUsernamePayload,
    type UsersQueryTypeByID,
    type UsersQueryTypeByUsername,
    type UsersTableRow,
    type WorldOverviewsQueryBySystemID,
    type WorldOverviewsQueryTypeBySystemID,
    type WorldOverviewsTableRow,
    type WorldsQueryByID,
    type WorldsQueryTypeByID,
    type WorldsTableRow,
    type DFGalaxyValue,
    type DFOnlineValue,
    type MeSingletonValue,
    type SysOverviewsQueryByCoords,
    type SysOverviewsQueryBySectorID,
    type SysOverviewsQueryTypeByCoords,
    type SysOverviewsQueryTypeBySectorID,
    type SysOverviewsTableRow,
    type SystemsQueryByID,
    type SystemsQueryTypeByID,
    type SystemsTableRow,
    ActionExploreSystem,
    type ExploreSystemPayload,
} from '../lib/net/types.generated';
import { ws } from '../lib/net/ws';
import { createDatafrontAction } from '../lib/datafront/action';

const updater = createDatafrontUpdater(ws);

export const gameDataFront = {
    galaxy: createDatafrontSingleton<DFGalaxyValue, GalacticOverview>({
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
    }),

    me: createDatafrontSingleton<MeSingletonValue, CurrentUserData>({
        name: 'me',
        ws,
        updater,
        map: (u) => ({
            user: {
                id: u.userId,
                username: u.username,
                created: new Date(u.created),
                status: {
                    isVerified: true,
                    license: 'free',
                },
            },
        }),
    }),

    online: createDatafrontSingleton<DFOnlineValue, number>({
        name: 'online',
        ws,
        updater,
        map: (value) => value.count,
    }),

    sysOverviews: createDatafrontTable<
        SysOverviewsTableRow,
        StarSystemOverview,
        Record<typeof SysOverviewsQueryTypeBySectorID, SysOverviewsQueryBySectorID> &
            Record<typeof SysOverviewsQueryTypeByCoords, SysOverviewsQueryByCoords>
    >({
        name: 'sys_overviews',
        ws,
        updater,
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
    }),

    systems: createDatafrontTable<
        SystemsTableRow,
        StarSystemContent,
        Record<typeof SystemsQueryTypeByID, SystemsQueryByID>
    >({
        name: 'systems',
        ws,
        updater,
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
    }),

    users: createDatafrontTable<
        UsersTableRow,
        User,
        Record<typeof UsersQueryTypeByID, UsersQueryByIDPayload> &
            Record<typeof UsersQueryTypeByUsername, UsersQueryByUsernamePayload>
    >({
        name: 'users',
        ws,
        updater,
        map: (u) => ({
            id: u.id,
            username: u.username || '',
            created: new Date(u.created || ''),
            status: {
                isVerified: true,
                license: 'free',
            },
        }),
    }),

    worldOverviews: createDatafrontTable<
        WorldOverviewsTableRow,
        WorldOverview,
        Record<typeof WorldOverviewsQueryTypeBySystemID, WorldOverviewsQueryBySystemID>
    >({
        name: 'world_overviews',
        ws,
        updater,
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
            };
        },
    }),

    worlds: createDatafrontTable<WorldsTableRow, World, Record<typeof WorldsQueryTypeByID, WorldsQueryByID>>({
        name: 'worlds',
        ws,
        updater,
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
    }),

    exploreSystem: createDatafrontAction<ExploreSystemPayload>({ name: ActionExploreSystem, ws }),
};

export default gameDataFront;
