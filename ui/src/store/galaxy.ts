import { createQuery } from '@tanstack/solid-query';
import { GalacticGrid, GalacticLabelType, type GalacticOverview } from '../domain/GalacticOverview';
import { type StarSystemContent, type StarSystemOverview } from '../domain/StarSystem';
import { type CelestialBody, CelestialBodyClass } from '../domain/CelestialBody';
import { type CelestialSurface } from '../domain/CelstialSurface';
import { type Star } from '../domain/Star';
import { Color } from '../lib/color';
import type * as api from '../lib/net/types.generated';
import { ws } from '../lib/net/ws';
import { GraphicsQuality, useDeviceSettings } from './settings';

const SCOPE_NAME = 'galaxy';

enum GalaxyContentCommands {
    GetSectorContent = 'getSectorContent',
    GetOverview = 'getOverview',
    GetSystemContent = 'getSystemContent',
    GetSurface = 'getSurface',
}

export type SectorContent = {
    systems: StarSystemOverview[];
    total: number;
};

export function useSectorContent(sectorId: () => string | null) {
    return createQuery(() => {
        const sid = sectorId();
        return {
            queryKey: ['galaxy', 'sector-content', sid],
            enabled: Boolean(sid),
            queryFn: async (): Promise<SectorContent> => {
                const { systems, total } = await ws.sendCommand<
                    api.WorldGetSectorContentResult,
                    api.WorldGetSectorContentPayload
                >(SCOPE_NAME, GalaxyContentCommands.GetSectorContent, { sectorId: sid!, limit: 0, q: '', offset: 0 });

                const transformed = systems.map((data): StarSystemOverview => {
                    const result: StarSystemOverview = {
                        id: data.systemId,
                        coords: {
                            r: data.gR,
                            theta: data.gTheta,
                            h: data.gH,
                        },
                        stars: [],
                        nPlanets: data.nPlanets,
                        nAsteroids: data.nAsteroids,
                        isExplored: data.isExplored,
                        exploredAt: new Date(data.exploredAt),
                        exploredBy: data.exploredBy,
                    };
                    for (const sData of data.stars) {
                        result.stars.push(decodeStar(sData));
                    }
                    return result;
                });

                return {
                    systems: transformed,
                    total,
                };
            },
        };
    });
}

export function useGalaxyOverview() {
    const deviceSettings = useDeviceSettings();

    let landmarksLimit: number;
    switch (deviceSettings.settings.graphicsQuality) {
        case GraphicsQuality.Low:
            landmarksLimit = 50;
            break;

        case GraphicsQuality.Medium:
            landmarksLimit = 100;
            break;

        case GraphicsQuality.High:
            landmarksLimit = 200;
            break;
    }

    return createQuery(() => ({
        queryKey: ['galaxy', 'overview'],
        staleTime: Infinity,
        queryFn: async (): Promise<GalacticOverview> => {
            const { grid, landmarks, labels } = await ws.sendCommand<
                api.WorldGetGalaxyOverviewResult,
                api.WorldGetGalaxyOverviewPayload
            >(SCOPE_NAME, GalaxyContentCommands.GetOverview, { landmarksLimit });

            return {
                grid: new GalacticGrid({
                    innerR: grid.innerR,
                    outerR: grid.outerR,
                    maxH: grid.maxH,
                    sectors: grid.sectors.map((data) => {
                        return {
                            id: data.sectorId,
                            innerR: data.innerR,
                            outerR: data.outerR,
                            thetaStart: data.thetaStart,
                            thetaEnd: data.thetaEnd,
                        };
                    }),
                }),

                landmarks: landmarks.map((data) => {
                    return {
                        id: data.starId,
                        coords: {
                            r: data.gR,
                            theta: data.gTheta,
                            h: data.gH,
                        },
                        luminositySuns: data.lumSuns,
                        tempK: data.tempK,
                    };
                }),

                labels: labels.map((data) => {
                    return {
                        type: GalacticLabelType.parse(data.type),
                        label: data.label,
                        coords: {
                            r: data.gR,
                            theta: data.gTheta,
                            h: data.gH,
                        },
                    };
                }),
            };
        },
    }));
}

export function useSystemContent(systemId: () => string | undefined) {
    return createQuery(() => {
        const sysId = systemId();
        return {
            queryKey: ['galaxy', sysId],
            enabled: Boolean(sysId),
            staleTime: 0,
            queryFn: async () => {
                const { orbits, stars, surfaces } = await ws.sendCommand<
                    api.WorldGetSystemContentResult,
                    api.WorldGetSystemContentPayload
                >(SCOPE_NAME, GalaxyContentCommands.GetSystemContent, { systemId: sysId! });

                const result: StarSystemContent = {
                    id: sysId!,
                    orbits: {},
                    stars: stars.map(decodeStar),
                    bodies: {},
                };

                for (const orbit of orbits) {
                    result.orbits[orbit.bodyId] = {
                        aroundId: orbit.around || null,
                        bodyId: orbit.bodyId,
                        semiMajorAu: orbit.semiMajorAu,
                        eccentricity: orbit.ecc,
                        inclination: orbit.incl,
                        rotation: orbit.rot,
                        timeAtPeriapsis: new Date(orbit.t0 * 1000),
                    };
                }

                console.log(surfaces);

                for (const body of surfaces) {
                    result.bodies[body.surfaceId] = {
                        id: body.surfaceId,
                        radiusKm: body.radiusKm,
                        ageByrs: body.ageByrs,
                        class: CelestialBodyClass.fromString(body.class),
                        isExplored: body.isExplored,
                        size: body.size,
                        surface: {
                            tempK: body.avgTempK,
                            pressureBar: body.surfacePressureBar,
                            g: body.g,
                        },
                    };
                }

                return result;
            },
        };
    });
}

export function useSurfaceOverview(surfaceId: () => string | undefined) {
    return createQuery(() => {
        const id = surfaceId();
        return {
            queryKey: ['galaxy', id],
            enabled: Boolean(id),
            staleTime: 0,
            queryFn: async (): Promise<{ body: CelestialBody; surface: CelestialSurface }> => {
                const surface = await ws.sendCommand<api.WorldGetSurfaceResult, api.WorldGetSurfacePayload>(
                    SCOPE_NAME,
                    GalaxyContentCommands.GetSurface,
                    { surfaceId: id! },
                );

                return {
                    body: {
                        id: surface.surfaceId,
                        // TODO
                        ageByrs: 0,
                        class: 'unknown',
                        isExplored: true,
                        radiusKm: 0,
                        size: surface.grid.edges.length,
                        surface: {
                            g: 0,
                            pressureBar: surface.pressureBar,
                            tempK: surface.avgTempK,
                        },
                    },
                    surface: {
                        grid: {
                            coords: surface.grid.coords,
                            edges: surface.grid.edges,
                        },
                        colors: surface.colors.map((nums) => Color.toRGB([nums[0], nums[1], nums[2]])),
                        elevations: surface.elevations,
                        biomes: surface.surfaceTypes,
                        oceanLevel: surface.oceansLevel,
                        atmosphere: surface.atmosphere,
                        oceans: surface.oceans,
                    },
                };
            },
        };
    });
}

function decodeStar(data: api.WorldGetSectorContentResultStar): Star {
    return {
        id: data.starId,
        tempK: data.tempK,
        ageBillionYears: data.ageByrs,
        luminositySuns: data.lumSuns,
        massSuns: data.massSuns,
        radiusAu: data.radiusAu,
    };
}
