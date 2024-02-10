import { createEffect, onCleanup } from 'solid-js';
import type * as T from 'three';
import { useSceneRenderer } from '../context';

export function useInScene(object: () => T.Object3D) {
    const { scene } = useSceneRenderer();

    createEffect(() => {
        const obj = object();

        scene().add(obj);

        onCleanup(() => {
            scene().remove(obj);
        });
    });

    onCleanup(() => {
        scene().remove(object());
    });
}
