import { createContext, createEffect, createMemo, useContext } from 'solid-js';
import { createStore } from 'solid-js/store';
import { Inventory, Storage, StorageType } from '@/domain/Inventory';
import { areSetsEqual } from '@/lib/misc';
import { outOfContext } from '@/lib/solid/context';

export type InventoryTransferFormState = {
    selection: Inventory;
    selectedTargetId: string | null;
    selectedSourceId: string | null;
};

export const createFormState = ({ targets }: { targets: () => Storage[] }) => {
    const [state, updateState] = createStore<InventoryTransferFormState>({
        selection: Inventory.empty(),
        selectedTargetId: null,
        selectedSourceId: null,
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
        const selectedId = state.selectedTargetId;
        if (selectedId === null) {
            return null;
        }

        for (const t of targets()) {
            if (t.id === selectedId) {
                return t;
            }
        }

        return null;
    });

    const selectedSource = createMemo(() => {
        const selectedId = state.selectedSourceId;
        if (selectedId === null) {
            return null;
        }

        for (const t of targets()) {
            if (t.id === selectedId) {
                return t;
            }
        }

        return null;
    });

    return { state, updateState, selectedCommodityIds, selectedTarget, selectedSource };
};

export type FormContext = ReturnType<typeof createFormState> & {
    allStorages: () => Storage[];
    isLoading: () => boolean;
};

const formContext = createContext<FormContext>({
    get state() {
        return outOfContext();
    },
    updateState: outOfContext,
    selectedCommodityIds: outOfContext,
    selectedTarget: outOfContext,
    selectedSource: outOfContext,

    allStorages: outOfContext,
    isLoading: outOfContext,
});

export const FormContextProvider = formContext.Provider;
export const useFormContext = () => useContext(formContext);

export function usePrefilledInitialValues({
    sourceId,
    allStorages,
    update,
}: {
    sourceId: () => string | null;
    allStorages: () => Storage[];
    update: (values: Partial<InventoryTransferFormState>) => void;
}) {
    createEffect(() => {
        const sourceStorageId = sourceId();
        const availableStorages = allStorages();

        const result: Partial<InventoryTransferFormState> = {};
        let hasUpdates = false;

        if (sourceStorageId) {
            result.selectedSourceId = sourceStorageId;
            hasUpdates = true;
        }

        if (sourceStorageId && availableStorages.length > 1) {
            // we can preselect a storage for the user
            let targetTypeToFind: StorageType | undefined;

            // if source storage is a factory, the user probably wants to transfer the items to their base,
            // and vice versa
            switch (Storage.getStorageTypeFromId(sourceStorageId)) {
                case StorageType.Base:
                    targetTypeToFind = StorageType.Factory;
                    break;

                case StorageType.Factory:
                    targetTypeToFind = StorageType.Base;
                    break;
            }

            // otherwise we can just pick the first one
            const targetToSelect =
                (targetTypeToFind !== undefined && availableStorages.find((s) => s.type === targetTypeToFind)) ||
                availableStorages.find((s) => s.id !== sourceStorageId);

            if (targetToSelect) {
                result.selectedTargetId = targetToSelect.id;
                hasUpdates = true;
            }
        }

        if (hasUpdates) {
            update(result);
        }
    });
}
