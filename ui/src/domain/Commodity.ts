import { formatScalar } from '../lib/strings';
import type { StorageSize } from './Inventory';

export type CommodityData = {
    id: string;
    size: StorageSize;
    category: string;
    quantized: boolean;
};

export namespace Commodity {
    export function stringifyAmount(
        c: CommodityData | undefined,
        amount: number,
        opts?: { strictQuantized?: boolean; explicitPlusSign?: boolean },
    ): string {
        if (!c) {
            return formatScalar(amount, { explicitPlusSign: opts?.explicitPlusSign });
        }

        if (c.quantized) {
            return formatScalar(amount, {
                digits: opts?.strictQuantized ? 0 : 1,
                explicitPlusSign: opts?.explicitPlusSign,
            });
        }

        return formatScalar(amount * c.size.mass, { unit: 't', digits: 1, explicitPlusSign: opts?.explicitPlusSign });
    }
}

/** TODO: figure out the difference from Inventory */
export type ConstructionCost = Record<string, number>;

export namespace ConstructionCost {
    export function empty(): ConstructionCost {
        return {};
    }

    export function add(target: ConstructionCost, addition: ConstructionCost): void {
        for (const [cid, amt] of Object.entries(addition)) {
            if (!target[cid]) {
                target[cid] = 0;
            }

            target[cid] += amt;
        }
    }
}
