import type * as T from 'three';
import { DirectionalLight } from '../../components/three/DirectionalLight/DirectionalLight';
import { createRef } from '../../lib/solid/ref';
import { useAnimation } from '../../components/three/hooks/useAnimation';
import { AmbientLight } from '../../components/three/AmbientLight/AmbientLight';

const SUN_Y = 0.3;
const SUN_ROTATION_PERIOD = 30000;
const SUN_ROTATION_FACTOR = (Math.PI * 2) / SUN_ROTATION_PERIOD;

export const PlanetViewSceneLight = () => {
    const light = createRef<T.DirectionalLight>();

    useAnimation(({ time }) => {
        const sun = light.value();
        if (!sun) {
            return;
        }

        sun.position.set(Math.cos(time * SUN_ROTATION_FACTOR), SUN_Y, Math.sin(time * SUN_ROTATION_FACTOR));
    });

    return (
        <>
            <DirectionalLight ref={light.ref} color={0xffffff} intensity={1} />
            <AmbientLight color={0xffffff} intensity={0.05} />
        </>
    );
};
