import type * as T from 'three';
import { PerspectiveCamera } from '../../components/three/PerspectiveCamera/PerspectiveCamera';
import { createRef } from '../../lib/solid/ref';
import { useLazyAnimation } from '../../components/three/hooks/useAnimation';
import { onMount } from 'solid-js';
import { useSceneRenderer } from '../../components/three/context';
import { useDrag } from '../../lib/solid/drag';

const CAMERA_DISTANCE = 2.5;
const PITCH_MIN = 0.087; // ~5deg
const PITCH_MAX = Math.PI - PITCH_MIN;

export const PlanetViewSceneCamera = () => {
    const camera = createRef<T.PerspectiveCamera>();
    const { canvas } = useSceneRenderer();

    let yaw = 0;
    let pitch = Math.PI / 2;

    const relocateCamera = useLazyAnimation(() => {
        const cam = camera.value();
        if (!cam) {
            return;
        }

        cam.position.setFromSphericalCoords(CAMERA_DISTANCE, pitch, yaw);
        cam.lookAt(0, 0, 0);
    });

    const { handlers } = useDrag({
        onDrag: (ev) => {
            const dpitch = -ev.lastChange.y * (Math.PI / 1000);
            const dyaw = -ev.lastChange.x * (Math.PI / 1000);

            yaw += dyaw;
            pitch = Math.max(PITCH_MIN, Math.min(pitch + dpitch, PITCH_MAX));

            relocateCamera();
        },
    });

    onMount(() => {
        relocateCamera();

        const c = canvas();

        c.addEventListener('mousedown', handlers.onMouseDown);
        c.addEventListener('mouseup', handlers.onMouseUp);
    });

    return <PerspectiveCamera ref={camera.ref} main fov={75} far={1000} near={0.01} />;
};
