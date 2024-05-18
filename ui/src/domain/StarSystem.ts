import { type GalacticCoords } from './GalacticCoords';
import { type Star } from './Star';

export type StarSystem = {
    id: string;
    coords: GalacticCoords;
    stars: Star[];
    nPlanets: number;
    nAsteroids: number;
};
