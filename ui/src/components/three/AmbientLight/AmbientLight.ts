import { createEffect, type Component } from 'solid-js';
import * as T from 'three';
import { useInScene } from '../hooks/useInScene';

type AmbientLightProps = {
    color?: T.ColorRepresentation;
    intensity?: number;
};

export const AmbientLight: Component<AmbientLightProps> = (props) => {
    const light = new T.AmbientLight();

    useInScene(() => light);

    createEffect(() => {
        if (props.color) {
            light.color = new T.Color(props.color);
        }
    });
    createEffect(() => {
        if (props.intensity) {
            light.intensity = props.intensity;
        }
    });

    return null;
};
