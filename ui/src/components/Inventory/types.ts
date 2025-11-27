import type { Predictable } from '@/lib/predictables';

export type InventoryEntry = {
    commodity: string;
    amount?: Predictable;
    speed?: number;
};

export type InventoryEntryWithData = InventoryEntry & {
    mass: number;
    volume: number;
    quantized: boolean;
};
