import type { Inventory } from './Inventory';

export type Recipe = {
    id: string;
    inputs: Inventory;
    outputs: Inventory;
    equipment: string;
};
