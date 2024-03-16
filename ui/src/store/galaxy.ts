import { createQuery } from '@tanstack/solid-query';
import { type Star } from '../domain/Star';
import { GalacticGrid, GalacticLabelType, type GalacticOverview } from '../domain/GalacticOverview';
import type * as api from '../lib/net/types.generated';
import { ws } from '../lib/net/ws';

const SCOPE_NAME = 'galaxy';

enum GalaxyContentCommands {
    GetSectorContent = 'getSectorContent',
    GetOverview = 'getOverview',
}

export function useSectorContent(sectorId: () => string | null) {
    return createQuery(() => {
        const sid = sectorId();
        return {
            queryKey: ['galaxy', 'sector-content', sid],
            staleTime: Infinity,
            enabled: Boolean(sid),
            queryFn: async (): Promise<Star[]> => {
                const { stars } = await ws.sendCommand<
                    api.WorldGetSectorContentResult,
                    api.WorldGetSectorContentPayload
                >(SCOPE_NAME, GalaxyContentCommands.GetSectorContent, { sectorId: sid!, limit: 0 });

                return stars.map((data): Star => {
                    return {
                        id: data.starId,
                        tempK: data.tempK,
                        ageBillionYears: data.ageByrs,
                        luminositySuns: data.lumSuns,
                        massSuns: data.massSuns,
                        radiusAu: data.radiusAu,
                        coords: {
                            r: data.gR,
                            theta: data.gTheta,
                            h: data.gH,
                        },
                    };
                });
            },
        };
    });
}

export function useGalaxyOverview() {
    return createQuery(() => ({
        queryKey: ['galaxy', 'overview'],
        staleTime: Infinity,
        queryFn: async (): Promise<GalacticOverview> => {
            const { grid, landmarks, labels } = await ws.sendCommand<api.WorldGetGalaxyOverviewResult>(
                SCOPE_NAME,
                GalaxyContentCommands.GetOverview,
            );

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
