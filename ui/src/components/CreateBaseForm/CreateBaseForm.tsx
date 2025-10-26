import { type Component, createMemo } from 'solid-js';
import type { City } from '../../domain/City';
import { type Company } from '../../domain/Company';
import { World } from '../../domain/World';
import { dfCreateBase, useOwnCompanies } from '../../store/datafront';
import { Banner } from '../Banner/Banner';
import { Button } from '../Button/Button';
import { Container } from '../Container/Container';
import { Form, FormActions, FormField } from '../Form';
import { TextInput } from '../TextInput/TextInput';
import { Text } from '../Text/Text';

export type CreateBaseFormProps = {
    worldId: string;
    tileId: string;
    tileCity: City;
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

    const onSubmit = () => {
        const operator = selectedCompany();
        if (!operator) {
            return;
        }

        action.run({
            worldId: props.worldId,
            tileId: World.parseTileId(props.tileId)!,
            operator: operator.id,
        });
    };

    return (
        <Form onSubmit={onSubmit} loading={action.isLoading()} error={action.error()}>
            <Banner color="info" margin="bottom">
                This action will create a new base. Right now this action comes free of charge.
            </Banner>
            <Container background="light" padded>
                <FormField>
                    <Text size="large" tag="div">
                        Details
                    </Text>
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
