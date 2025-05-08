import { createEffect, createSignal } from 'solid-js';
import { createValidationState } from '../Form';

type ParserReactiveProps = {
    value?: number;
    onUpdate?: (value: number, ev: MouseEvent | InputEvent) => void;
    min?: number;
    max?: number;
    integer?: boolean;
    disabled?: boolean;
};

export function createParser(initialValue: number | undefined, props: ParserReactiveProps) {
    const [getText, setText] = createSignal(toString(initialValue));
    const parserValidation = createValidationState();
    let lastParsedValue = initialValue ?? NaN;

    const validate = (input: string): boolean => {
        if (!input) {
            parserValidation.setError('The value must be a number');
            return false;
        }

        const parsed = Number(input);
        if (Number.isNaN(parsed)) {
            parserValidation.setError('The value must be a number');
            return false;
        }

        lastParsedValue = parsed;
        if (lastParsedValue < (props.min ?? -Infinity)) {
            parserValidation.setError(`The value must be greater than ${props.min}`);
            return false;
        }
        if (lastParsedValue > (props.max ?? Infinity)) {
            parserValidation.setError(`The value must be less than ${props.max}`);
            return false;
        }
        if (props.integer && !Number.isInteger(lastParsedValue)) {
            parserValidation.setError(`The value must be an integer`);
            return false;
        }

        parserValidation.setOk();
        return true;
    };

    const updateText = (newText: string, ev: MouseEvent | InputEvent) => {
        if (props.disabled || !props.onUpdate) {
            return;
        }

        setText(newText);

        const valid = validate(newText);
        if (valid) {
            props.onUpdate(lastParsedValue, ev);
        }
    };

    createEffect(() => {
        const value = props.value;
        if (value === lastParsedValue) {
            return;
        }

        setText(toString(value));
        lastParsedValue = value ?? NaN;
    });

    return {
        getText,
        updateText,
        parserValidation,
    };
}

export function toString(n: number | undefined): string {
    if (n === undefined || Number.isNaN(n)) {
        return '';
    }
    return n.toString();
}
