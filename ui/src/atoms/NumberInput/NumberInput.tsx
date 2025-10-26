import { type Component, createMemo } from 'solid-js';
import { IconMinus, IconPlus } from '@/icons';
import { Button } from '../Button/Button';
import { Container } from '../Container/Container';
import { type ValidationState } from '../Form';
import { useCombinedValidationState } from '../Form/validation';
import { TextInput } from '../TextInput/TextInput';
import { createParser } from './utils';

export type NumberInputProps = {
    value: number | undefined;
    onUpdate?: (value: number, ev: MouseEvent | InputEvent) => void;

    label?: string;
    placeholder?: string;
    readonly?: boolean;
    disabled?: boolean;
    noIcon?: boolean;
    hint?: string;
    noErrorMessage?: boolean;
    validity?: ValidationState;

    min?: number;
    max?: number;
    integer?: boolean;
};

export const NumberInput: Component<NumberInputProps> = (props) => {
    const { getText, updateText, parserValidation } = createParser(props.value, props);
    const allValidators = createMemo(() => [parserValidation.get(), props.validity]);
    const validity = useCombinedValidationState(allValidators);

    const canDecrement = () => {
        if (!props.onUpdate) {
            return false;
        }

        if (props.value === undefined) {
            return true;
        }

        return props.value - 1 >= (props.min ?? -Infinity);
    };

    const canIncrement = () => {
        if (!props.onUpdate) {
            return false;
        }

        if (props.value === undefined) {
            return true;
        }

        return props.value + 1 <= (props.max ?? Infinity);
    };

    return (
        <TextInput
            value={getText()}
            onUpdate={updateText}
            disabled={props.disabled}
            noIcon={props.noIcon}
            readonly={props.readonly || !props.onUpdate}
            validity={validity()}
            hint={props.hint}
            noErrorMessage={props.noErrorMessage}
            inputMode={props.integer ? 'numeric' : 'decimal'}
            placeholder={props.placeholder}
            label={props.label}
            controls={
                <Container direction="row" hasGap size="s">
                    <Button
                        square
                        size="s"
                        style="light"
                        disabled={!canDecrement()}
                        onClick={(ev) => {
                            ev.preventDefault();
                            if (!props.onUpdate) {
                                return;
                            }

                            props.onUpdate(
                                props.value === undefined ? props.max ?? props.min ?? 0 : props.value - 1,
                                ev,
                            );
                        }}
                    >
                        <IconMinus block />
                    </Button>
                    <Button
                        square
                        size="s"
                        style="light"
                        disabled={!canIncrement()}
                        onClick={(ev) => {
                            ev.preventDefault();
                            if (!props.onUpdate) {
                                return;
                            }

                            props.onUpdate(
                                props.value === undefined ? props.min ?? props.max ?? 0 : props.value + 1,
                                ev,
                            );
                        }}
                    >
                        <IconPlus block />
                    </Button>
                </Container>
            }
        />
    );
};
