import { onCleanup, onMount } from 'solid-js';

export type KeyboardTracker = {
    isPressed: Readonly<Record<string, boolean | undefined>>;
};

export function useKeyboardTracker(): KeyboardTracker {
    const pressedKeys: Record<string, boolean | undefined> = {};

    const onKeyDown = (ev: KeyboardEvent) => {
        pressedKeys[ev.code] = true;
    };
    const onKeyUp = (ev: KeyboardEvent) => {
        pressedKeys[ev.code] = false;
    };

    onMount(() => {
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);
    });
    onCleanup(() => {
        document.removeEventListener('keydown', onKeyDown);
        document.removeEventListener('keyup', onKeyUp);
    });

    return { isPressed: pressedKeys };
}
