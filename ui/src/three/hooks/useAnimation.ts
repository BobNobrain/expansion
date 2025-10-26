import { onMount, onCleanup } from 'solid-js';
import { useSceneRenderer } from '../context';
import type { AnimationHandler } from '../types';

export function useAnimation(onFrame: AnimationHandler) {
    const { animation } = useSceneRenderer();

    onMount(() => {
        const id = animation.on(onFrame);
        onCleanup(() => {
            animation.off(id);
        });
    });
}

export function useLazyAnimation(onFrame: AnimationHandler): () => void {
    let shouldUpdate = false;
    const notifyForUpdate = () => {
        shouldUpdate = true;
    };

    const { animation } = useSceneRenderer();

    onMount(() => {
        const id = animation.on((frameData) => {
            if (!shouldUpdate) {
                return;
            }
            shouldUpdate = false;

            onFrame(frameData);
        });
        onCleanup(() => {
            animation.off(id);
        });
    });

    return notifyForUpdate;
}

export type ControlledAnimation = {
    start: () => void;
    stop: () => void;
};

export function useControlledAnimation(onFrame: AnimationHandler): ControlledAnimation {
    const { animation } = useSceneRenderer();
    let id: number | undefined;

    const start = () => {
        id = animation.on(onFrame);
    };
    const stop = () => {
        if (id !== undefined) {
            animation.off(id);
        }
    };

    onMount(() => {
        start();

        onCleanup(() => {
            stop();
        });
    });

    return { start, stop };
}
