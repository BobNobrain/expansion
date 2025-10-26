import { onCleanup, onMount } from 'solid-js';
import { useSceneRenderer } from '../context';

export const useCanvasListener: HTMLCanvasElement['addEventListener'] = (
    event: string,
    listener: EventListenerOrEventListenerObject,
) => {
    const { canvas } = useSceneRenderer();

    onMount(() => {
        canvas().addEventListener(event, listener as never);
    });

    onCleanup(() => canvas().removeEventListener(event, listener));
};
