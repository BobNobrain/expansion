import type { Predictable } from '@/lib/predictables';
import type { Duration } from '@/lib/time';
import type { CommodityData } from './Commodity';

export type StorageSize = {
    /* tons */
    mass: number;
    /* cubic meters */
    volume: number;
};

export namespace StorageSize {
    export function zero(): StorageSize {
        return { mass: 0, volume: 0 };
    }

    export function addInto(target: StorageSize, addition: Readonly<StorageSize>, factor = 1.0) {
        target.mass += addition.mass * factor;
        target.volume += addition.volume * factor;
    }
}

export type Inventory = Record<string, number>;

export namespace Inventory {
    export const STANDARD_TIME_DELTA: Duration = { h: 1 };

    export function empty(): Inventory {
        return {};
    }

    export function from(amounts: Record<string, number>): Inventory {
        return amounts;
    }

    export function measure(inventory: Inventory, commoditiesData: Record<string, CommodityData>): StorageSize {
        const total = StorageSize.zero();

        for (const [cid, amount] of Object.entries(inventory)) {
            const commodity = commoditiesData[cid];
            if (!commodity) {
                continue;
            }

            StorageSize.addInto(total, commodity.size, amount);
        }

        return total;
    }

    export function addInto(target: Inventory, addition: Readonly<Inventory>, factor = 1.0) {
        for (const [cid, amount] of Object.entries(addition)) {
            target[cid] ??= 0;
            target[cid] += amount * factor;
        }
    }

    export function multiply(source: Readonly<Inventory>, factor: number): Inventory {
        const result = empty();

        for (const [cid, amount] of Object.entries(source)) {
            result[cid] ??= 0;
            result[cid] += amount * factor;
        }

        return result;
    }
}

export type DynamicInventory = Record<string, Predictable>;
