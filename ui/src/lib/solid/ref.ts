import { createSignal } from 'solid-js';

export interface CreateRefResult<T> {
    value: () => T | null;
    ref: (value: T | null) => void;
}

export function createRef<T>(): CreateRefResult<T> {
    let value: T | null = null;

    return {
        value: () => value,
        ref: (newValue) => {
            value = newValue;
        },
    };
}

export function createReactiveRef<T>(): CreateRefResult<T> {
    const [getValue, setValue] = createSignal<T | null>(null);

    return {
        value: getValue,
        ref: setValue,
    };
}
