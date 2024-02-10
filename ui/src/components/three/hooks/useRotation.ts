import { createEffect } from 'solid-js';
import type * as T from 'three';

export type UseEulerRotationProps = {
    rotationEuler?: T.Euler;
};

export function useEulerRotation(props: UseEulerRotationProps, object: T.Object3D) {
    createEffect(() => {
        if (props.rotationEuler) {
            object.setRotationFromEuler(props.rotationEuler);
        }
    });
}
