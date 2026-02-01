import { createMemo, Show, type Component } from 'solid-js';
import { Button, Form, FormActions, FormField, TextInput, createFormFieldState, useValidateAll } from '@/atoms';
import { dfCreateFactory } from '@/store/datafront';
import { createIdempotencyToken } from '@/lib/datafront/utils';

export type CreateFactoryFormProps = {
    baseId: number | undefined;
    nFactoriesExisting: number;
    onCancel?: () => void;
    onSuccess?: () => void;
};

export const CreateFactoryForm: Component<CreateFactoryFormProps> = (props) => {
    const defaultName = createMemo(() => {
        const letter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.max(0, props.nFactoriesExisting) % 26];
        return `Factory ${letter}`;
    });

    const factoryName = createFormFieldState('', {
        validateOnChange: false,
        validator: (_value) => {
            return { type: 'ok' };
        },
    });
    const validateForm = useValidateAll([factoryName]);

    const idempotencyToken = createIdempotencyToken();
    const action = dfCreateFactory.use(idempotencyToken.getToken);

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
                name: factoryName.get() || defaultName(),
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
            <p>
                This action will create a new factory project at your base. You can give it a name to differentiate it
                from other factories on this base.
            </p>
            <FormField>
                <TextInput
                    label="Factory Name"
                    placeholder={defaultName()}
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
