import { type Component } from 'solid-js';
import * as T from 'three';
import { type RawColor, type RawVertex } from '../../lib/3d/types';
import { useInScene } from '../../components/three/hooks/useInScene';

export type GalaxyStarsProps = {
    positions: RawVertex[];
    colors: RawColor[];
};

export const GalaxyStars: Component<GalaxyStarsProps> = (props) => {
    const starsMaterial = new T.PointsMaterial({
        color: 0xffffff,
        size: 1,
        sizeAttenuation: false,
        fog: false,
        vertexColors: true,
    });

    const starsGeom = new T.BufferGeometry();
    starsGeom.setAttribute('position', new T.BufferAttribute(new Float32Array(props.positions.flat()), 3));
    starsGeom.setAttribute('color', new T.BufferAttribute(new Float32Array(props.colors.flat()), 3));

    const stars = new T.Points(starsGeom, starsMaterial);
    useInScene(() => stars);

    return null;
};
