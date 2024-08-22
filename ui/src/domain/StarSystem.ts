import { type CelestialBody } from './CelestialBody';
import { type GalacticCoords } from './GalacticCoords';
import { type Orbit } from './Orbit';
import { type Star } from './Star';

export type StarSystemOverview = {
    id: string;
    coords: GalacticCoords;
    stars: Star[];
    nPlanets: number;
    nAsteroids: number;
    isExplored: boolean;
    exploredBy: string;
    exploredAt: Date;
};

export type StarSystemContent = {
    id: string;
    orbits: Record<string, Orbit>;
    stars: Star[];
    bodies: Record<string, CelestialBody>;
};

// export namespace StarSystemContent {
//     export function empty(): StarSystemContent {

//     }
// }
