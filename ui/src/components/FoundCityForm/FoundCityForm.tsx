import { type Component } from 'solid-js';
import { Form, FormActions, FormField } from '../Form';
import { TextInput } from '../TextInput/TextInput';
import { Button } from '../Button/Button';
import { IconDice } from '../../icons';
import { getRandomCityName } from './names';
import { createFormFieldState, useValidateAll } from '../Form/utils';

export type FoundCityFormProps = {
    onSuccess?: () => void;
};

export const FoundCityForm: Component<FoundCityFormProps> = (props) => {
    const cityName = createFormFieldState('', {
        validateOnChange: false,
        validator: (value) => {
            if (!value) {
                return { type: 'error', message: 'You need to provide city name' };
            }

            return { type: 'ok' };
        },
    });
    const validateForm = useValidateAll([cityName]);

    const randomizeName = () => {
        cityName.set(getRandomCityName());
    };

    const onSubmit = () => {
        if (!validateForm()) {
            return;
        }

        // TODO: call the action
        props.onSuccess?.();
    };

    return (
        <Form onSubmit={onSubmit}>
            <p>
                This action will create a building site for a city on this planet. You are given the honor to name this
                future settlement.
            </p>
            <FormField>
                <TextInput
                    formKey="name"
                    label="City Name"
                    placeholder="Name the new city"
                    value={cityName.get()}
                    onUpdate={cityName.set}
                    validity={cityName.validity()}
                    onBlur={cityName.validate}
                    controls={
                        <Button style="light" size="s" square onClick={randomizeName}>
                            <IconDice size={24} />
                        </Button>
                    }
                />
            </FormField>
            <FormActions>
                <Button color="primary" type="submit">
                    Continue
                </Button>
            </FormActions>
        </Form>
    );
};
