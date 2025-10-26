import { createEffect, type Component } from 'solid-js';
import { type Object3D } from 'three';
import { useInScene } from '../hooks/useInScene';

type SceneObjectProps = {
    name?: string;
    object: Object3D | null;
};

export const SceneObject: Component<SceneObjectProps> = (props) => {
    createEffect(() => {
        if (props.object && props.name) {
            props.object.name = props.name;
        }
    });

    useInScene(() => props.object);
    return null;
};
