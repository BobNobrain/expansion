import type { Component } from 'solid-js';
import { useSceneRenderer } from '@/three/context';
import { useAnimation } from '@/three/hooks/useAnimation';
import { PerspectiveCamera } from '@/three/PerspectiveCamera/PerspectiveCamera';
import { Vector3 } from 'three';

const CAM_ROTATION_PERIOD = 45_000;
const CAM_ROTATION_FACTOR = (Math.PI * 2) / CAM_ROTATION_PERIOD;
const DISTANCE = 1.5;

export const PVSAutoCamera: Component = () => {
    const { getMainCamera } = useSceneRenderer();

    useAnimation((frame) => {
        const cam = getMainCamera();
        if (!cam) {
            return;
        }

        const t = frame.time;
        cam.position.set(
            DISTANCE * Math.cos(-t * CAM_ROTATION_FACTOR),
            DISTANCE,
            DISTANCE * Math.sin(-t * CAM_ROTATION_FACTOR),
        );
        cam.lookAt(new Vector3(0, 0, 0));
    });

    return <PerspectiveCamera main fov={75} far={10} near={0.01} />;
};
