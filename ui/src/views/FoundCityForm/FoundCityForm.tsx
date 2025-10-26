import { Show, type Component } from 'solid-js';
import { Button, Form, FormActions, FormField, TextInput, createFormFieldState, useValidateAll } from '@/atoms';
import { World } from '@/domain/World';
import { IconDice } from '@/icons';
import { useExploreRouteInfo } from '@/routes/explore';
import { dfFoundCity } from '@/store/datafront';
import { getRandomCityName } from './names';

export type FoundCityFormProps = {
    onCancel?: () => void;
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
    const randomizeName = () => cityName.set(getRandomCityName());

    const routeInfo = useExploreRouteInfo();
    const action = dfFoundCity.use(() => routeInfo().tileId!);

    const onSubmit = () => {
        if (!validateForm()) {
            return;
        }

        const { tileId, objectId, objectType } = routeInfo();
        const tileIndex = World.parseTileId(tileId!);
        if (!tileId || !objectId || objectType !== 'world' || tileIndex === undefined) {
            throw new Error('wrong route state for FoundCityForm: ' + JSON.stringify(routeInfo()));
        }

        action.run(
            {
                name: cityName.get(),
                tileId: tileIndex,
                worldId: objectId,
            },
            {
                onSuccess: props.onSuccess,
            },
        );
    };

    return (
        <Form onSubmit={onSubmit} loading={action.isLoading()} error={action.error()}>
            <p>
                This action will create a building site for a city on this planet. You are given the honor to name this
                future settlement.
            </p>
            <FormField>
                <TextInput
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
            <FormField>
                <TextInput label="Location" value={`${routeInfo().objectId}#${routeInfo().tileId}`} disabled />
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
