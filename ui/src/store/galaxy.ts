/** @deprecated TODO: remove */
import { createQuery } from '@tanstack/solid-query';
import { GalacticGrid, type GalacticOverview } from '../domain/GalacticOverview';
import { type StarSystemContent, type StarSystemOverview } from '../domain/StarSystem';
import { type WorldOverview } from '../domain/WorldOverview';
import { type CelestialSurface } from '../domain/World';

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
            // eslint-disable-next-line @typescript-eslint/require-await
            queryFn: async (): Promise<SectorContent> => {
                return {
                    systems: [],
                    total: 0,
                };
            },
        };
    });
}

export function useGalaxyOverview() {
    // const deviceSettings = useDeviceSettings();

    // let landmarksLimit: number;
    // switch (deviceSettings.settings.graphicsQuality) {
    //     case GraphicsQuality.Low:
    //         landmarksLimit = 50;
    //         break;

    //     case GraphicsQuality.Medium:
    //         landmarksLimit = 100;
    //         break;

    //     case GraphicsQuality.High:
    //         landmarksLimit = 200;
    //         break;
    // }

    return createQuery(() => ({
        queryKey: ['galaxy', 'overview'],
        staleTime: Infinity,
        // eslint-disable-next-line @typescript-eslint/require-await
        queryFn: async (): Promise<GalacticOverview> => {
            return {
                grid: new GalacticGrid({
                    innerR: 1,
                    outerR: 5,
                    maxH: 1,
                    sectors: [],
                }),
                landmarks: [],
                labels: [],
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
            // eslint-disable-next-line @typescript-eslint/require-await
            queryFn: async () => {
                const result: StarSystemContent = {
                    id: sysId!,
                    orbits: {},
                    stars: [],
                    bodies: {},
                };

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
            // eslint-disable-next-line @typescript-eslint/require-await
            queryFn: async (): Promise<{ body: WorldOverview; surface: CelestialSurface }> => {
                return {
                    body: {
                        id: '',
                        // TODO
                        ageByrs: 0,
                        class: 'unknown',
                        isExplored: true,
                        radiusKm: 0,
                        size: 0,
                        surface: {
                            g: 0,
                            pressureBar: 0,
                            tempK: 0,
                        },
                    },
                    surface: {
                        grid: {
                            coords: [],
                            edges: [],
                        },
                        colors: [],
                        elevations: [],
                        biomes: [],
                        oceanLevel: 0,
                        atmosphere: {},
                        oceans: {},
                    },
                };
            },
        };
    });
}

// function decodeStar(data: api.WorldGetSectorContentResultStar): Star {
//     return {
//         id: data.starId,
//         tempK: data.tempK,
//         ageBillionYears: data.ageByrs,
//         luminositySuns: data.lumSuns,
//         massSuns: data.massSuns,
//         radiusAu: data.radiusAu,
//     };
// }
