import { createEffect, Show, type Component } from 'solid-js';
import { Button, Form, FormActions, FormField, TextInput, createFormFieldState, useValidateAll } from '@/atoms';
import { dfRenameBase } from '@/store/datafront';
import { createIdempotencyToken } from '@/lib/datafront/utils';

export type RenameBaseFormProps = {
    baseId: number | undefined;
    currentName: string | undefined;
    onCancel?: () => void;
    onSuccess?: () => void;
};

export const RenameBaseForm: Component<RenameBaseFormProps> = (props) => {
    const baseName = createFormFieldState(props.currentName || '', {
        validateOnChange: false,
        validator: (value) => {
            if (!value) {
                return { type: 'error', message: 'Please provide a new name' };
            }
            return { type: 'ok' };
        },
    });
    const validateForm = useValidateAll([baseName]);

    createEffect(() => {
        if (props.currentName) {
            baseName.set(props.currentName);
        }
    });

    const idempotencyToken = createIdempotencyToken();
    const action = dfRenameBase.use(idempotencyToken.getToken);

    const onSubmit = () => {
        if (props.baseId === undefined) {
            return;
        }

        if (!validateForm()) {
            return;
        }

        idempotencyToken.aquire();
        action.run(
            {
                baseId: props.baseId,
                name: baseName.get(),
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
            <p>You can rename your bases to make telling them apart easier. This name is only visible to you.</p>
            <FormField>
                <TextInput
                    label="Base Name"
                    value={baseName.get()}
                    onUpdate={baseName.set}
                    validity={baseName.validity()}
                    onBlur={baseName.validate}
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
