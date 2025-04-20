import type { Predictable } from '../../lib/predictables';

export type InventoryEntry = {
    commodity: string;
    amount: Predictable;
};

export type InventoryEntryWithData = InventoryEntry & {
    density: number;
    quantized: boolean;
};
