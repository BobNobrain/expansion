import { createMemo, type Component } from 'solid-js';
import * as T from 'three';
import { useInScene } from '../../components/three/hooks/useInScene';
import { Orbit } from '../../domain/Orbit';
import { type RawVertex } from '../../lib/3d/types';
import { Angle } from '../../lib/math/angle';

export type SystemMapSceneOrbitProps = {
    orbit: Orbit;
};

const mat = new T.LineBasicMaterial({ color: 0x808080 });

export const SystemMapSceneOrbit: Component<SystemMapSceneOrbitProps> = (props) => {
    const line = createMemo(() => {
        const verticies = buildEllipse(props.orbit);
        const geom = new T.BufferGeometry();
        geom.setAttribute('position', new T.BufferAttribute(new Float32Array(verticies.flat()), 3));

        const line = new T.LineLoop(geom, mat);
        return line;
    });

    useInScene(line);

    return null;
};

function buildEllipse(orbit: Orbit): RawVertex[] {
    const angleStep = 0.05;
    return Orbit.coordsFromTrueAnomalies(orbit, Angle.iterateFullCircle(angleStep));
}
