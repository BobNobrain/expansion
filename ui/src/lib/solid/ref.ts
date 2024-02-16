import { createSignal } from 'solid-js';

export interface CreateRefResult<T> {
    value: () => T | null;
    ref: (value: T) => void;
}

export function createRef<T>(chained?: (value: T) => void): CreateRefResult<T> {
    let value: T | null = null;

    return {
        value: () => value,
        ref: (newValue) => {
            value = newValue;
            chained?.(newValue);
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
