import { formatInteger, formatScalar } from '../lib/strings';

export type CommodityData = {
    id: string;
    mass: number;
    volume: number;
    category: string;
    quantized: boolean;
};

export namespace Commodity {
    export function stringifyAmount(c: CommodityData | undefined, amount: number): string {
        if (!c) {
            return formatScalar(amount);
        }

        if (c.quantized) {
            return formatInteger(amount);
        }

        return formatScalar((amount * c.mass) / c.volume, { unit: 't', digits: 1 });
    }
}

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
