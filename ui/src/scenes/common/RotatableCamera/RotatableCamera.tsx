import { type Component, createEffect, onCleanup, onMount } from 'solid-js';
import * as T from 'three';
import {
    PerspectiveCamera,
    type PerspectiveCameraProps,
} from '../../../components/three/PerspectiveCamera/PerspectiveCamera';
import { createRef } from '../../../lib/solid/ref';
import { useLazyAnimation } from '../../../components/three/hooks/useAnimation';
import { useSceneRenderer } from '../../../components/three/context';
import { useDrag } from '../../../lib/solid/drag';

const PITCH_MIN = 0.087; // ~5deg
const PITCH_MAX = Math.PI - PITCH_MIN;
const ZOOM_SENSITIVITY = 0.1;

const EPS = 1e-6;

export type RotatableCameraProps = PerspectiveCameraProps & {
    targetX?: number;
    targetY?: number;
    targetZ?: number;

    pitchLimit?: number;
    minDistance?: number;
    maxDistance?: number;

    yawInertia?: number;
    pitchInertia?: number;
};

export const RotatableCamera: Component<RotatableCameraProps> = (props) => {
    const camera = createRef<T.PerspectiveCamera>(props.ref);
    const { canvas } = useSceneRenderer();

    let yaw = 0;
    let pitch = Math.PI / 2;

    let isInertiaAllowed = false;
    let yawV = 0;
    let pitchV = 0;

    const updateRotation = (dyaw: number, dpitch: number) => {
        yaw += dyaw;
        pitch = Math.max(PITCH_MIN, Math.min(pitch + dpitch, PITCH_MAX));
        relocateCamera();
    };

    const { minDistance = 0, maxDistance } = props;
    let distance = maxDistance === undefined ? 1 : minDistance + (maxDistance - minDistance) / 2;

    const relocateCamera = useLazyAnimation(() => {
        const cam = camera.value();
        if (!cam) {
            return;
        }

        const { targetX = 0, targetY = 0, targetZ = 0 } = props;

        cam.position.setFromSphericalCoords(distance, pitch, yaw).add(new T.Vector3(targetX, targetY, targetZ));
        cam.lookAt(targetX, targetY, targetZ);

        if (isInertiaAllowed && (yawV || pitchV)) {
            const inertia = props.yawInertia ?? 0;
            updateRotation(yawV, pitchV);
            yawV *= inertia;
            pitchV *= inertia * inertia;

            if (Math.abs(yawV) < EPS) {
                yawV = 0;
            }
            if (Math.abs(pitchV) < EPS) {
                pitchV = 0;
            }
        }
    });

    const { handlers } = useDrag({
        onStart: () => {
            isInertiaAllowed = false;
        },
        onDrag: (ev) => {
            const dpitch = -ev.lastChange.y * (Math.PI / 1000);
            const dyaw = -ev.lastChange.x * (Math.PI / 1000);

            yawV = dyaw * (props.yawInertia ?? 0);
            pitchV = dpitch * (props.pitchInertia ?? 0);
            updateRotation(dyaw, dpitch);
        },
        onEnd: () => {
            isInertiaAllowed = true;
            relocateCamera();
        },
    });

    const handleZoom = (ev: WheelEvent) => {
        const { minDistance = 0, maxDistance } = props;
        const distanceScaling = maxDistance === undefined ? minDistance : (maxDistance - minDistance) / 100;
        const d = ev.deltaY * ZOOM_SENSITIVITY * distanceScaling;

        distance = Math.max(props.minDistance ?? 0, Math.min(distance + d, props.maxDistance ?? Infinity));

        relocateCamera();
    };

    createEffect(() => {
        if (props.targetX !== undefined || props.targetY !== undefined || props.targetZ !== undefined) {
            relocateCamera();
        }
    });

    onMount(() => {
        relocateCamera();

        const c = canvas();

        c.addEventListener('mousedown', handlers.onMouseDown);
        c.addEventListener('mouseup', handlers.onMouseUp);

        c.addEventListener('wheel', handleZoom);

        onCleanup(() => {
            c.removeEventListener('mousedown', handlers.onMouseDown);
            c.removeEventListener('mouseup', handlers.onMouseUp);

            c.removeEventListener('wheel', handleZoom);
        });
    });

    return <PerspectiveCamera ref={camera.ref} far={props.far} fov={props.fov} main={props.main} near={props.near} />;
};
