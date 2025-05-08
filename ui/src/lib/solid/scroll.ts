import { type JSX } from 'solid-js';

export function useDebouncedScrollHandler<T extends HTMLElement = HTMLElement>(
    handler: (el: HTMLElement) => void,
    debounceTimeoutMs = 20,
): JSX.EventHandlerWithOptions<T, Event> {
    let timeoutId: number | undefined;

    return {
        passive: true,
        handleEvent(this: T) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handler, debounceTimeoutMs, this);
        },
    };
}

export function useThrottledScrollHandler<T extends HTMLElement = HTMLElement>(
    handler: (el: HTMLElement) => void,
    throttleTimeoutMs = 20,
): JSX.EventHandlerWithOptions<T, Event> {
    let timeoutId: number | undefined;
    let lastTimeCalled = -Infinity;

    return {
        passive: true,
        handleEvent(this: T) {
            const now = performance.now();
            if (now - lastTimeCalled < throttleTimeoutMs) {
                return;
            }

            lastTimeCalled = now;
            clearTimeout(timeoutId);
            timeoutId = setTimeout(handler, 0, this);
        },
    };
}
