import { createSignal, type Component, createEffect, Show } from 'solid-js';
import Decimal from 'decimal.js';
import styles from './NumberInput.module.css';
import { Button } from '../Button/Button';
import { createValidationState } from '../Form/validation';
import { registerInFormContext } from '../Form/context';

export type NumberInputOldProps = {
    value: number | undefined;
    onUpdate: (value: number, ev: MouseEvent | InputEvent) => void;

    placeholder?: string | number;
    readonly?: boolean;
    disabled?: boolean;
    hint?: string;

    min?: number;
    max?: number;
    multipleOf?: number;

    formKey?: string;
};

export const NumberInputOld: Component<NumberInputOldProps> = (props) => {
    const validation = createValidationState();
    const [getText, setText] = createSignal(toString(props.value));
    let lastParsedValue = props.value ?? NaN;

    const validate = (input: string): boolean => {
        if (!input) {
            validation.setError('The value must be a number');
            return false;
        }

        const parsed = Number(input);
        if (Number.isNaN(parsed)) {
            validation.setError('The value must be a number');
            return false;
        }

        lastParsedValue = parsed;
        if (lastParsedValue < (props.min ?? -Infinity)) {
            validation.setError(`The value must be greater than ${props.min}`);
            return false;
        }
        if (lastParsedValue > (props.max ?? Infinity)) {
            validation.setError(`The value must be less than ${props.max}`);
            return false;
        }
        if (props.multipleOf !== undefined && lastParsedValue % props.multipleOf != 0) {
            validation.setError(`The value must be a multiple of ${props.multipleOf}`);
            return false;
        }

        validation.setOk();
        return true;
    };

    if (props.formKey) {
        registerInFormContext(props, {
            validate: () => {
                const state = validation.get();
                if (state === undefined) {
                    return validate(getText());
                }
                return state.type === 'ok';
            },
        });
    }

    createEffect(() => {
        const value = props.value;
        if (value === lastParsedValue) {
            return;
        }
        setText(toString(value));
        lastParsedValue = value ?? NaN;
    });

    const onTextUpdated = (ev: InputEvent) => {
        if (props.disabled) {
            return;
        }

        const newText = (ev.target as HTMLInputElement).value;
        setText(newText);

        const valid = validate(newText);

        if (valid) {
            props.onUpdate(lastParsedValue, ev);
        }
    };

    const onStep = (step: 1 | -1) => (ev: MouseEvent) => {
        if (props.disabled) {
            return;
        }

        let initialValue = props.value;
        if (initialValue === undefined) {
            initialValue = step > 0 ? props.min : props.max;
            initialValue ??= props.min ?? props.max ?? 0;
        }

        let stepSize = 1;
        if (props.multipleOf !== undefined) {
            stepSize = props.multipleOf;
        } else if (props.max !== undefined || props.min !== undefined) {
            const gridSizeOfMax = props.max === undefined ? undefined : getDecimalGridSize(props.max);
            const gridSizeOfMin = props.min === undefined ? undefined : getDecimalGridSize(props.min);
            let gridSize = 0;
            if (gridSizeOfMin !== undefined && gridSizeOfMax !== undefined) {
                gridSize = gridSizeOfMin === gridSizeOfMax ? gridSizeOfMin - 1 : Math.min(gridSizeOfMin, gridSizeOfMax);
            } else if (gridSizeOfMin !== undefined) {
                gridSize = gridSizeOfMin ?? 0;
            } else if (gridSizeOfMax !== undefined) {
                gridSize = gridSizeOfMax - 1;
            }
            stepSize = Math.pow(10, gridSize);
        }
        const change = new Decimal(stepSize).mul(step);
        const newValue = change.add(initialValue).clamp(props.min ?? -Infinity, props.max ?? Infinity);

        validation.setOk();
        lastParsedValue = newValue.toNumber();
        setText(newValue.toString());
        props.onUpdate(lastParsedValue, ev);
    };
    const incr = onStep(1);
    const decr = onStep(-1);

    const onBlur = () => {
        if (validate(getText())) {
            setText(toString(props.value));
        }
    };

    const hintText = () => validation.getErrorMessage() ?? props.hint;

    return (
        <div
            class={styles.wrapper}
            classList={{
                [styles[validation.getColor()]]: true,
            }}
        >
            <Button
                square
                disabled={
                    props.disabled || (props.value === undefined ? false : props.value <= (props.min ?? -Infinity))
                }
                onClick={decr}
            >
                -
            </Button>
            <input
                class={styles.input}
                value={getText()}
                onInput={onTextUpdated}
                onBlur={onBlur}
                readOnly={props.readonly}
                disabled={props.disabled}
                type="text"
                lang="en-US"
                inputMode="numeric"
                min={props.min}
                max={props.max}
                placeholder={typeof props.placeholder === 'number' ? props.placeholder.toString() : props.placeholder}
            />

            <Show when={hintText()}>
                {(hintText) => (
                    <div
                        class={styles.hint}
                        classList={{
                            [styles.errorMessage]: Boolean(validation.getErrorMessage()),
                        }}
                    >
                        {hintText()}
                    </div>
                )}
            </Show>
            <Button
                compact
                disabled={
                    props.disabled || (props.value === undefined ? false : props.value >= (props.max ?? Infinity))
                }
                onClick={incr}
            >
                +
            </Button>
        </div>
    );
};

function getDecimalGridSize(n: number): number | undefined {
    if (n === 0) {
        return undefined;
    }

    const [whole, decimals] = n.toFixed(20).split('.');
    for (let i = decimals.length - 1; i >= 0; i--) {
        const digit = decimals[i];
        if (digit !== '0') {
            return i - 1;
        }
    }
    for (let i = whole.length - 1; i >= 0; i--) {
        const digit = whole[i];
        if (digit !== '0') {
            return whole.length - i - 1;
        }
    }

    return undefined; // somehow we got here
}

function toString(n: number | undefined): string {
    if (n === undefined || Number.isNaN(n)) {
        return '';
    }
    return n.toString();
}
