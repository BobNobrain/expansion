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

    export function infinite(): StorageSize {
        return { mass: Infinity, volume: Infinity };
    }

    export function isInfinite(s: StorageSize): boolean {
        return !Number.isFinite(s.mass) || !Number.isFinite(s.volume);
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

    export function counts(i: Inventory): Record<string, number> {
        return i;
    }

    export function getAllCommodities(i: Inventory): Set<string> {
        return new Set(Object.keys(Inventory.counts(i)));
    }

    export function clone(i: Inventory): Inventory {
        return { ...i };
    }
}

export type DynamicInventory = Record<string, Predictable>;

export namespace DynamicInventory {
    export function sample(d: DynamicInventory, t: Date | number): Inventory {
        const result = Inventory.empty();
        for (const [cid, p] of Object.entries(d)) {
            result[cid] = p.predict(t);
        }
        return result;
    }
}

export enum StorageType {
    Base = 'base',
    Factory = 'factory',
}

export type Storage = {
    id: string;
    name: string;
    type: StorageType;
    staticContent: Inventory;
    dynamicContent: DynamicInventory | null;
    sizeLimit: StorageSize;
};

export namespace Storage {
    export function measureFilledPercentage(
        s: Storage,
        now: Date,
        commoditiesData: Record<string, CommodityData>,
    ): number {
        if (StorageSize.isInfinite(s.sizeLimit)) {
            return 0;
        }

        if (s.sizeLimit.mass === 0 || s.sizeLimit.volume === 0) {
            return 1;
        }

        const staticSize = Inventory.measure(s.staticContent, commoditiesData);
        const dynamicSize = s.dynamicContent
            ? Inventory.measure(DynamicInventory.sample(s.dynamicContent, now), commoditiesData)
            : StorageSize.zero();

        const massPercentage = (staticSize.mass + dynamicSize.mass) / s.sizeLimit.mass;
        const volumePercentage = (staticSize.volume + dynamicSize.volume) / s.sizeLimit.volume;

        return Math.min(1, Math.max(massPercentage, volumePercentage, 0));
    }

    export function getCommodityAmount(
        storage: Pick<Storage, 'staticContent' | 'dynamicContent'>,
        cid: string,
        at: Date | number,
    ): number {
        let amount = storage?.staticContent[cid] ?? 0;
        if (storage.dynamicContent && storage.dynamicContent[cid]) {
            amount += storage.dynamicContent[cid].predict(at);
        }
        return amount;
    }

    export function sampleStorage(
        storage: Pick<Storage, 'staticContent' | 'dynamicContent'>,
        at: Date | number,
    ): Inventory {
        const result = Inventory.clone(storage.staticContent);
        if (storage.dynamicContent) {
            Inventory.addInto(result, DynamicInventory.sample(storage.dynamicContent, at));
        }
        return result;
    }
}
