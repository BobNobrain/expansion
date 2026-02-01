import { ConfirmationForm } from '@/components/ConfirmationForm/ConfirmationForm';
import { dfDemolishFactory } from '@/store/datafront';
import type { Component } from 'solid-js';

export type DemolishedFactoryData = {
    worldId: string | undefined;
    tileId: string | undefined;
};

export type DemolishFactoryFormProps = {
    factoryId: number | undefined;
    factoryData: DemolishedFactoryData;
    onSuccess: (data: DemolishedFactoryData) => void;
    onCancel: () => void;
};

export const DemolishFactoryForm: Component<DemolishFactoryFormProps> = (props) => {
    const action = dfDemolishFactory.use(() => String(props.factoryId));

    return (
        <ConfirmationForm
            onConfirm={() => {
                if (props.factoryId === undefined) {
                    return;
                }

                const data = props.factoryData;

                action.run(
                    { factoryId: props.factoryId },
                    {
                        onSuccess: () => props.onSuccess(data),
                    },
                );
            }}
            onCancel={props.onCancel}
            isLoading={action.isLoading()}
            confirmText="Demolish"
            confirmColor="error"
        >
            Do you really want to demolish this factory? You will get its current inventory, as well as all construction
            materials that can be salvaged after the demolition.
        </ConfirmationForm>
    );
};
