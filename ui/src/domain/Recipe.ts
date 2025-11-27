import type { Inventory } from './Inventory';

export type Recipe = {
    id: number;
    inputs: Inventory;
    outputs: Inventory;
    equipment: string;

    affectedByFertility?: boolean;
    affectedByResource?: boolean;
    affectedByOcean?: boolean;
    affectedByAtmosphere?: boolean;
};
