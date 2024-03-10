import { createQuery } from '@tanstack/solid-query';
import { type Star } from '../domain/Star';
import { type GalacticGrid } from '../domain/GalacticGrid';
import type * as api from '../lib/net/types.generated';
import { ws } from '../lib/net/ws';

const SCOPE_NAME = 'galaxy';

enum GalaxyContentCommands {
    GetSectorContent = 'getSectorContent',
    GetGrid = 'getGrid',
}

export function useSectorContent(sectorId: () => string) {
    return createQuery(() => ({
        queryKey: ['galaxy', 'sector-content', sectorId()],
        staleTime: Infinity,
        queryFn: async (): Promise<Star[]> => {
            const { stars } = await ws.sendCommand<api.WorldGetSectorContentResult, api.WorldGetSectorContentPayload>(
                SCOPE_NAME,
                GalaxyContentCommands.GetSectorContent,
                { sectorId: sectorId(), limit: 200 },
            );

            return stars.map((data): Star => {
                return {
                    id: data.starId,
                    tempK: data.tempK,
                    ageBillionYears: data.ageByrs,
                    luminositySuns: data.lumSuns,
                    massSuns: data.massSuns,
                    radiusAu: data.radiusAu,
                };
            });
        },
    }));
}

export function useGalaxyGrid() {
    return createQuery(() => ({
        queryKey: ['galaxy', 'grid'],
        staleTime: Infinity,
        queryFn: async (): Promise<GalacticGrid> => {
            const grid = await ws.sendCommand<api.WorldGetGalaxyGridResult>(SCOPE_NAME, GalaxyContentCommands.GetGrid);
            return {
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
            };
        },
    }));
}
