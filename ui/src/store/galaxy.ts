import { createQuery } from '@tanstack/solid-query';
import { GalacticGrid, GalacticLabelType, type GalacticOverview } from '../domain/GalacticOverview';
import { type StarSystem } from '../domain/StarSystem';
import type * as api from '../lib/net/types.generated';
import { ws } from '../lib/net/ws';
import { GraphicsQuality, useDeviceSettings } from './settings';

const SCOPE_NAME = 'galaxy';

enum GalaxyContentCommands {
    GetSectorContent = 'getSectorContent',
    GetOverview = 'getOverview',
}

export type SectorContent = {
    systems: StarSystem[];
    total: number;
};

export function useSectorContent(sectorId: () => string | null) {
    return createQuery(() => {
        const sid = sectorId();
        return {
            queryKey: ['galaxy', 'sector-content', sid],
            staleTime: Infinity,
            enabled: Boolean(sid),
            queryFn: async (): Promise<SectorContent> => {
                const { systems, total } = await ws.sendCommand<
                    api.WorldGetSectorContentResult,
                    api.WorldGetSectorContentPayload
                >(SCOPE_NAME, GalaxyContentCommands.GetSectorContent, { sectorId: sid!, limit: 0, q: '', offset: 0 });

                const transformed = systems.map((data): StarSystem => {
                    const result: StarSystem = {
                        id: data.systemId,
                        coords: {
                            r: data.gR,
                            theta: data.gTheta,
                            h: data.gH,
                        },
                        stars: [],
                        nPlanets: data.nPlanets,
                        nAsteroids: data.nAsteroids,
                    };
                    for (const sData of data.stars) {
                        result.stars.push({
                            id: sData.starId,
                            tempK: sData.tempK,
                            ageBillionYears: sData.ageByrs,
                            luminositySuns: sData.lumSuns,
                            massSuns: sData.massSuns,
                            radiusAu: sData.radiusAu,
                            coords: {
                                r: data.gR,
                                theta: data.gTheta,
                                h: data.gH,
                            },
                        });
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
