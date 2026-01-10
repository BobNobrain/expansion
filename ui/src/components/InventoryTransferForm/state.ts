import { createContext, createEffect, createMemo, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Inventory, Storage, StorageType } from '@/domain/Inventory';
import { areSetsEqual } from '@/lib/misc';
import { calcPredictableDelta } from '@/lib/predictables';
import { outOfContext } from '@/lib/solid/context';

export type InventoryTransferFormState = {
    selection: Inventory;
    selectedTargetId: string | null;
};

export const createFormState = ({ targets }: { targets: () => Storage[] }) => {
    const [state, updateState] = createStore<InventoryTransferFormState>({
        selection: Inventory.empty(),
        selectedTargetId: null,
    });

    const selectedCommodityIds = createMemo((oldValue): Set<string> => {
        const newValue = Inventory.getAllCommodities(state.selection);
        if (!oldValue || !areSetsEqual(oldValue, newValue)) {
            console.log('selectedCommodityIds recalc');
            return newValue;
        }
        return oldValue;
    });

    const selectedTarget = createMemo(() => {
        for (const t of targets()) {
            if (t.id === state.selectedTargetId) {
                return t;
            }
        }

        return null;
    });

    return { state, updateState, selectedCommodityIds, selectedTarget };
};

export type FormContext = ReturnType<typeof createFormState> & {
    source: () => Storage | null;
    targets: () => Storage[];
    isLoading: () => boolean;
};

const formContext = createContext<FormContext>({
    get state() {
        return outOfContext();
    },
    updateState: outOfContext,
    selectedCommodityIds: outOfContext,
    selectedTarget: outOfContext,

    source: outOfContext,
    targets: outOfContext,
    isLoading: outOfContext,
});

export const FormContextProvider = formContext.Provider;
export const useFormContext = () => useContext(formContext);

export function usePrefilledInitialValues({
    source,
    targets,
    update,
}: {
    source: () => Storage | null;
    targets: () => Storage[];
    update: (values: Partial<InventoryTransferFormState>) => void;
}) {
    createEffect(() => {
        const sourceStorage = source();
        const availableTargets = targets();

        const result: Partial<InventoryTransferFormState> = {};
        let hasUpdates = false;

        if (availableTargets.length > 0) {
            // we can preselect a storage for the user
            let targetTypeToFind: StorageType | undefined;

            // if source storage is a factory, the user probably wants to transfer the items to their base,
            // and vice versa
            switch (sourceStorage?.type) {
                case StorageType.Base:
                    targetTypeToFind = StorageType.Factory;
                    break;

                case StorageType.Factory:
                    targetTypeToFind = StorageType.Base;
                    break;
            }

            // otherwise we can just pick the first one
            const targetToSelect =
                (targetTypeToFind !== undefined && availableTargets.find((s) => s.type === targetTypeToFind)) ||
                availableTargets[0];

            result.selectedTargetId = targetToSelect.id;
            hasUpdates = true;
        }

        if (sourceStorage && sourceStorage.type === StorageType.Factory && sourceStorage.dynamicContent) {
            // if source storage is a factory, user's intention is probably to transfer all outputs to the base
            const now = new Date();
            result.selection = Inventory.empty();

            for (const [cid, amount] of Object.entries(sourceStorage.dynamicContent)) {
                const delta = calcPredictableDelta(amount, now, { h: 1 });
                if (delta < 0) {
                    continue;
                }

                result.selection[cid] = Storage.getCommodityAmount(sourceStorage, cid, now);
                hasUpdates = true;
            }
        }

        if (hasUpdates) {
            update(result);
        }
    });
}
