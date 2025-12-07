import { Inventory } from './Inventory';

export type Contribution = {
    required: Inventory;
    contributions: ContributionHistoryItem[];
};

export type ContributionHistoryItem = {
    contributor: string;
    amounts: Inventory;
    date: Date;
};

export namespace Contribution {
    export function empty(): Contribution {
        return {
            required: Inventory.empty(),
            contributions: [],
        };
    }

    export function getContributedTotal(c: Contribution): Inventory {
        const result = Inventory.empty();
        for (const item of c.contributions) {
            Inventory.addInto(result, item.amounts);
        }
        return result;
    }
}
