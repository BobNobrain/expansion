import { createSignal } from 'solid-js';

export type UseBlinkResult<T> = {
    getValue: () => T;
    blink: (value: T, durationMs?: number) => void;
};

export type UseBlinkOptions<T> = {
    durationMs?: number;
    initialValue: T;
};

export function useBlink<T>({ initialValue, durationMs: defaultDuration }: UseBlinkOptions<T>): UseBlinkResult<T> {
    const [getValue, setValue] = createSignal(initialValue);
    let timeoutId: number | undefined;

    return {
        getValue,
        blink: (value, durationMs) => {
            clearTimeout(timeoutId);
            setValue(value as never);
            timeoutId = setTimeout(setValue, durationMs ?? defaultDuration ?? 1000, initialValue);
        },
    };
}
