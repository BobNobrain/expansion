import type { ParentComponent } from 'solid-js';
import type { Inventory, Storage } from '@/domain/Inventory';
import { createFormController, useFormControllerRef, type FormController } from '@/lib/solid/form';
import { createFormState, FormContextProvider, usePrefilledInitialValues } from './state';

export type InventoryTransferFormResult = {
    selection: Inventory;
    targetStorageId: string;
};

export type InventoryTransferFormProps = {
    source: Storage | null;
    targets: Storage[];

    controllerRef?: (c: FormController<InventoryTransferFormResult>) => void;
    isLoading?: boolean;
};

export const InventoryTransferForm: ParentComponent<InventoryTransferFormProps> = (props) => {
    const { state, updateState, ...rest } = createFormState({
        targets: () => props.targets,
    });
    const { controller, onDataUpdated } = createFormController<InventoryTransferFormResult>({
        validateAndGetResult: () => {
            const { selectedTargetId, selection } = state;
            if (Object.keys(selection).length === 0 || Object.values(selection).every((count) => count === 0)) {
                return null;
            }

            if (selectedTargetId === null) {
                return null;
            }

            return { selection, targetStorageId: selectedTargetId };
        },
    });
    const updateAndNotify: typeof updateState = (...args: unknown[]) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, prefer-spread
        updateState.apply(null, args as never);
        onDataUpdated();
    };

    useFormControllerRef(controller, props, 'controllerRef');

    usePrefilledInitialValues({
        source: () => props.source,
        targets: () => props.targets,
        update: updateAndNotify,
    });

    return (
        <FormContextProvider
            value={{
                ...rest,
                state,
                updateState: updateAndNotify,
                source: () => props.source,
                targets: () => props.targets,
                isLoading: () => props.isLoading ?? false,
            }}
        >
            {props.children}
        </FormContextProvider>
    );
};
