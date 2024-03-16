import { type Component } from 'solid-js';
import { type Object3D } from 'three';
import { useInScene } from '../hooks/useInScene';

type SceneObjectProps = {
    object: Object3D | null;
};

export const SceneObject: Component<SceneObjectProps> = (props) => {
    useInScene(() => props.object);
    return null;
};
