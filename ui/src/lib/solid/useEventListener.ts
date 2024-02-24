import { onCleanup, onMount } from 'solid-js';
import { type Listenable, type Listener } from '../event';

export function useEventListener<T>(ev: Listenable<T>, handler: Listener<T>) {
    onMount(() => {
        const id = ev.on(handler);

        onCleanup(() => ev.off(id));
    });
}
