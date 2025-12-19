import { createEffect, createMemo, createSignal } from 'solid-js';
import { Contribution } from '@/domain/Contribution';
import { Inventory } from '@/domain/Inventory';

type SliderRow = {
    commodity: string;
    total: number;
    provided: number;
    available: () => number;
    current: () => number;
    setCurrent: (n: number) => void;
};

export function createContributionState(value: () => Contribution, available: () => Inventory | null) {
    const [currentCounts, setCurrentCounts] = createSignal<Record<string, number>>({});

    createEffect(() => {
        value();
        setCurrentCounts({});
    });

    const provided = createMemo(() => Contribution.getContributedTotal(value()));

    const sliders = createMemo(() => {
        const contribution = value();
        const availableMaterials = available() ?? Inventory.empty();
        const providedMaterials = provided();

        return Object.keys(contribution.required).map((commodity): SliderRow => {
            const total = contribution.required;

            return {
                commodity,
                total: total[commodity],
                provided: providedMaterials[commodity] ?? 0,
                available: () =>
                    Math.min(
                        availableMaterials[commodity] ?? 0,
                        total[commodity] - (providedMaterials[commodity] ?? 0),
                    ),
                current: () => currentCounts()[commodity] ?? 0,
                setCurrent: (x) => setCurrentCounts((old) => ({ ...old, [commodity]: x })),
            };
        });
    });

    const fillAll = () => {
        const filledCounts = Inventory.empty();
        const contribution = value();
        const providedMaterials = provided();
        const availableMaterials = available() ?? Inventory.empty();

        for (const cid of Object.keys(contribution.required)) {
            const available = availableMaterials[cid] ?? 0;
            const needed = contribution.required[cid] - (providedMaterials[cid] ?? 0);
            filledCounts[cid] = Math.min(available, needed);
        }

        setCurrentCounts(filledCounts);
    };

    const isSelectionEmpty = createMemo(() => {
        const counts = currentCounts();
        for (const n of Object.values(counts)) {
            if (n > 0) {
                return false;
            }
        }

        return true;
    });

    return { currentCounts, sliders, fillAll, isSelectionEmpty };
}
