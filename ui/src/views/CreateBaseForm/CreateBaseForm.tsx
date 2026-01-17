import { type Component, createMemo } from 'solid-js';
import {
    Banner,
    Button,
    Container,
    createFormFieldState,
    Form,
    FormActions,
    FormField,
    TextInput,
    useValidateAll,
} from '@/atoms';
import type { City } from '@/domain/City';
import { type Company } from '@/domain/Company';
import { World } from '@/domain/World';
import { dfCreateBase, useOwnCompanies } from '@/store/datafront';

export type CreateBaseFormProps = {
    worldId: string;
    tileId: string;
    tileCity: City;
    onSuccess?: () => void;
};

export const CreateBaseForm: Component<CreateBaseFormProps> = (props) => {
    const location = createMemo(() => `${props.worldId}#${props.tileId}`);
    const action = dfCreateBase.use(location);

    const ownCompanies = useOwnCompanies();
    const selectedCompany = createMemo<Company | null>(() => {
        const all = ownCompanies.result();
        const ids = Object.keys(all);
        if (!ids.length) {
            return null;
        }

        return all[ids[0]];
    });

    const defaultName = createMemo(() => {
        return `Base at ${location()}`;
    });

    const baseName = createFormFieldState('', {
        validateOnChange: false,
        validator: (_value) => {
            return { type: 'ok' };
        },
    });
    const validateForm = useValidateAll([baseName]);

    const onSubmit = () => {
        const operator = selectedCompany();
        if (!operator) {
            return;
        }

        if (!validateForm()) {
            return;
        }

        action.run(
            {
                worldId: props.worldId,
                tileId: World.parseTileId(props.tileId)!,
                operator: operator.id,
                name: baseName.get(),
            },
            {
                onSuccess: props.onSuccess,
            },
        );
    };

    return (
        <Form onSubmit={onSubmit} loading={action.isLoading()} error={action.error()}>
            <Banner color="info" margin="bottom">
                This action will create a new base. Right now this action comes free of charge.
            </Banner>
            <Container background="light" padded>
                <FormField>
                    <TextInput
                        label="Base Name"
                        placeholder={defaultName()}
                        value={baseName.get()}
                        onUpdate={baseName.set}
                        validity={baseName.validity()}
                        onBlur={baseName.validate}
                        clearable
                    />
                </FormField>
                <FormField>
                    <TextInput label="Location" value={location()} disabled />
                </FormField>
                <FormField>
                    <TextInput label="City" value={props.tileCity.name} disabled />
                </FormField>
                <FormField>
                    <TextInput label="Operator" value={selectedCompany()?.name ?? '--'} disabled />
                </FormField>
                <FormField>
                    <TextInput label="Fees" value="0.00" disabled />
                </FormField>
            </Container>

            <FormActions align="center">
                <Button
                    color="primary"
                    type="submit"
                    size="l"
                    loading={action.isLoading()}
                    disabled={Boolean(action.error() ? !action.error()!.retry : false)}
                >
                    Continue
                </Button>
            </FormActions>
        </Form>
    );
};
