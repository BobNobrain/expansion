import { type GalacticCoords } from './GalacticCoords';
import { type Orbit } from './Orbit';
import { type Star } from './Star';
import { type ExplorationData } from './misc';

export type StarSystemOverview = {
    id: string;
    coords: GalacticCoords;
    stars: Star[];
    nPlanets: number;
    nAsteroids: number;
    isExplored: boolean;
};

export type StarSystemContent = {
    id: string;
    orbits: Record<string, Orbit>;
    stars: Star[];
    explored: ExplorationData | null;
};
