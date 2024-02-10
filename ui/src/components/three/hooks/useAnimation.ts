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

            onFrame(frameData);
            shouldUpdate = false;
        });
        onCleanup(() => {
            animation.off(id);
        });
    });

    return notifyForUpdate;
}
