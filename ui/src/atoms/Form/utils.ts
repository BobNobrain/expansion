import { createEffect, createSignal } from 'solid-js';
import type { ValidationState } from './types';

export type FormFieldState<T> = {
    get: () => T;
    set: (value: T) => void;
    // update: (f: (old: T) => T) => void;
    validity: () => ValidationState;
    validate: () => boolean;
};

export type CreateFormFieldStateOptions<T> = {
    validateOnChange?: boolean;
    validator?: (value: T) => ValidationState;
};

export function createFormFieldState<T>(
    initialValue: T,
    { validator, validateOnChange = false }: CreateFormFieldStateOptions<T> = {},
): FormFieldState<T> {
    const [get, set] = createSignal(initialValue);
    const [validity, setValidity] = createSignal<ValidationState>({ type: 'ok' });

    const validate = () => {
        if (!validator) {
            return true;
        }

        const value = get();
        const state = validator(value);

        setValidity(state);
        return state.type === 'ok';
    };

    if (validateOnChange) {
        createEffect(validate);
    }

    return {
        get,
        set: (value) => {
            set(value as never);
            if (validity().type === 'error') {
                validate();
            }
        },
        validity,
        validate,
    };
}

export function useValidateAll(states: { validate: () => boolean }[]): () => boolean {
    return () => {
        let result = true;

        for (const state of states) {
            const next = state.validate();
            result &&= next;
        }

        return result;
    };
}
