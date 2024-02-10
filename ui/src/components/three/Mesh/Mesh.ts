import { type Component } from 'solid-js';
import type * as T from 'three';
import { type UsePositionProps, usePosition } from '../hooks/usePosition';
import { useInScene } from '../hooks/useInScene';

type MeshProps = UsePositionProps & {
    mesh: T.Mesh;
};

export const Mesh: Component<MeshProps> = (props) => {
    usePosition(props, props.mesh);
    useInScene(() => props.mesh);

    return null;
};
