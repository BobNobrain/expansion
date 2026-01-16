import type { ParentComponent } from 'solid-js';
import type { Inventory, Storage } from '@/domain/Inventory';
import { createFormController, useFormControllerRef, type FormController } from '@/lib/solid/form';
import { createFormState, FormContextProvider, usePrefilledInitialValues } from './state';

export type InventoryTransferFormResult = {
    selection: Inventory;
    targetStorageId: string;
    sourceStorageId: string;
};

export type InventoryTransferFormProps = {
    sourceId: string | null;
    storages: Storage[];

    controllerRef?: (c: FormController<InventoryTransferFormResult>) => void;
    isLoading?: boolean;
};

export const InventoryTransferForm: ParentComponent<InventoryTransferFormProps> = (props) => {
    const { state, updateState, ...rest } = createFormState({
        targets: () => props.storages,
    });
    const { controller, onDataUpdated } = createFormController<InventoryTransferFormResult>({
        validateAndGetResult: () => {
            const { selectedTargetId, selectedSourceId, selection } = state;
            if (Object.keys(selection).length === 0 || Object.values(selection).every((count) => count === 0)) {
                return null;
            }

            if (selectedTargetId === null || selectedSourceId === null) {
                return null;
            }

            return { selection, targetStorageId: selectedTargetId, sourceStorageId: selectedSourceId };
        },
    });
    const updateAndNotify: typeof updateState = (...args: unknown[]) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, prefer-spread
        updateState.apply(null, args as never);
        onDataUpdated();
    };

    useFormControllerRef(controller, props, 'controllerRef');

    usePrefilledInitialValues({
        sourceId: () => props.sourceId,
        allStorages: () => props.storages,
        update: updateAndNotify,
    });

    return (
        <FormContextProvider
            value={{
                ...rest,
                state,
                updateState: updateAndNotify,
                allStorages: () => props.storages,
                isLoading: () => props.isLoading ?? false,
            }}
        >
            {props.children}
        </FormContextProvider>
    );
};
