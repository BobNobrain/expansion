import { createEffect, Show, type Component } from 'solid-js';
import { Button, Form, FormActions, FormField, TextInput, createFormFieldState, useValidateAll } from '@/atoms';
import { dfRenameFactory } from '@/store/datafront';
import { createIdempotencyToken } from '@/lib/datafront/utils';

export type RenameFactoryFormProps = {
    factoryId: number | undefined;
    currentName: string | undefined;
    onCancel?: () => void;
    onSuccess?: () => void;
};

export const RenameFactoryForm: Component<RenameFactoryFormProps> = (props) => {
    const factoryName = createFormFieldState(props.currentName || '', {
        validateOnChange: false,
        validator: (value) => {
            if (!value) {
                return { type: 'error', message: 'Please provide a new name' };
            }
            return { type: 'ok' };
        },
    });
    const validateForm = useValidateAll([factoryName]);

    createEffect(() => {
        if (props.currentName) {
            factoryName.set(props.currentName);
        }
    });

    const idempotencyToken = createIdempotencyToken();
    const action = dfRenameFactory.use(idempotencyToken.getToken);

    const onSubmit = () => {
        if (props.factoryId === undefined) {
            return;
        }

        if (!validateForm()) {
            return;
        }

        idempotencyToken.aquire();
        action.run(
            {
                factoryId: props.factoryId,
                name: factoryName.get(),
            },
            {
                onSuccess: () => {
                    props.onSuccess?.();
                    idempotencyToken.release();
                },
                onError: () => {
                    idempotencyToken.release();
                },
            },
        );
    };

    return (
        <Form onSubmit={onSubmit} loading={action.isLoading()} error={action.error()}>
            <p>You can rename your factories to make telling them apart easier. This name is only visible to you.</p>
            <FormField>
                <TextInput
                    label="Factory Name"
                    value={factoryName.get()}
                    onUpdate={factoryName.set}
                    validity={factoryName.validity()}
                    onBlur={factoryName.validate}
                    clearable
                />
            </FormField>
            <FormActions>
                <Show when={props.onCancel}>
                    <Button style="text" disabled={action.isLoading()} onClick={props.onCancel}>
                        Cancel
                    </Button>
                </Show>
                <Button
                    color="primary"
                    type="submit"
                    loading={action.isLoading()}
                    disabled={Boolean(action.error() ? !action.error()!.retry : false)}
                >
                    Continue
                </Button>
            </FormActions>
        </Form>
    );
};
