import { type Component, createEffect, onCleanup, onMount } from 'solid-js';
import type * as T from 'three';
import {
    PerspectiveCamera,
    type PerspectiveCameraProps,
} from '../../../components/three/PerspectiveCamera/PerspectiveCamera';
import { createRef } from '../../../lib/solid/ref';
import { useLazyAnimation } from '../../../components/three/hooks/useAnimation';
import { useSceneRenderer } from '../../../components/three/context';
import { useDrag } from '../../../lib/solid/drag';
import { useEventListener } from '../../../lib/solid/useEventListener';
import { RotatableCameraState } from './RotatableCameraState';
import { useKeyboardTracker } from '../../../lib/solid/useKeyboardTracker';
import { KeyCodes } from '../../../lib/keyboard';
import { type RawVertex } from '../../../lib/3d/types';

const ZOOM_SENSITIVITY = 0.1;
const PINCH_ZOOM_SENSITIVITY = 1;
const TOUCH_PAN_SENSITIVITY = 5;

export type PanLimits = {
    x?: { min?: number; max?: number };
    y?: { min?: number; max?: number };
    z?: { min?: number; max?: number };
};

export type RotatableCameraProps = PerspectiveCameraProps & {
    targetX?: number;
    targetY?: number;
    targetZ?: number;

    minDistance?: number;
    maxDistance?: number;

    yawInertia?: number;
    pitchInertia?: number;

    initialYaw?: number;
    initialPitch?: number;

    pannable?: boolean;
    panLimits?: PanLimits;
    panSpeed?: number | ((distance: number) => number);
    panPlaneNormal?: RawVertex;
};

export const RotatableCamera: Component<RotatableCameraProps> = (props) => {
    const camera = createRef<T.PerspectiveCamera>(props.ref);
    const { canvas, gestures, animation } = useSceneRenderer();

    const keyboard = useKeyboardTracker();

    const cameraState = new RotatableCameraState();

    const { minDistance = 0, maxDistance, initialPitch, initialYaw } = props;
    const initialDistance = maxDistance === undefined ? 1 : minDistance + (maxDistance - minDistance) / 2;
    cameraState.setDistance(initialDistance);

    if (initialPitch !== undefined) {
        cameraState.setPitch(initialPitch);
    }
    if (initialYaw !== undefined) {
        cameraState.setYaw(initialYaw);
    }

    createEffect(() => {
        const { panLimits: { x = {}, y = {}, z = {} } = {} } = props;

        cameraState.setPanLimits({
            xMin: x.min ?? -Infinity,
            xMax: x.max ?? Infinity,
            yMin: y.min ?? -Infinity,
            yMax: y.max ?? Infinity,
            zMin: z.min ?? -Infinity,
            zMax: z.max ?? Infinity,
        });
    });

    const updateCamera = useLazyAnimation(() => {
        const cam = camera.value();
        if (!cam) {
            return;
        }

        cameraState.apply(cam);

        const { yawInertia = 0, pitchInertia = yawInertia } = props;
        cameraState.setRotationInertia(yawInertia, pitchInertia);

        const hasFinishedAnimation = cameraState.animationStep();
        if (!hasFinishedAnimation) {
            updateCamera();
        }
    });

    createEffect(() => {
        if (!props.pannable) {
            return;
        }

        const animationHandlerId = animation.on(({ dt }) => {
            let upDirection = 0;
            let rightDirection = 0;

            if (keyboard.isPressed[KeyCodes.ArrowDown] || keyboard.isPressed[KeyCodes.KeyS]) {
                upDirection -= 1;
            }
            if (keyboard.isPressed[KeyCodes.ArrowUp] || keyboard.isPressed[KeyCodes.KeyW]) {
                upDirection += 1;
            }

            if (keyboard.isPressed[KeyCodes.ArrowLeft] || keyboard.isPressed[KeyCodes.KeyA]) {
                rightDirection -= 1;
            }
            if (keyboard.isPressed[KeyCodes.ArrowRight] || keyboard.isPressed[KeyCodes.KeyD]) {
                rightDirection += 1;
            }

            if (!upDirection && !rightDirection) {
                return;
            }

            let panSpeed = 1e-3;
            switch (typeof props.panSpeed) {
                case 'function':
                    panSpeed = props.panSpeed(cameraState.getDistance());
                    break;

                case 'number':
                    panSpeed = props.panSpeed;
                    break;
            }
            cameraState.pan(upDirection * dt * panSpeed, rightDirection * dt * panSpeed, props.panPlaneNormal);
            updateCamera();
        });

        onCleanup(() => {
            if (animationHandlerId !== undefined) {
                animation.off(animationHandlerId);
            }
        });
    });

    const { handlers } = useDrag({
        onStart: () => {
            cameraState.hold();
        },
        onDrag: (ev) => {
            const dpitch = -ev.last.y * (Math.PI / 1000);
            const dyaw = -ev.last.x * (Math.PI / 1000);

            cameraState.updateRotationWithInertia(dyaw, dpitch);
            updateCamera();
        },
        onEnd: () => {
            cameraState.release();
            updateCamera();
        },
    });

    useEventListener(gestures.dragStart, () => {
        cameraState.hold();
    });
    useEventListener(gestures.drag, (drag) => {
        if (drag.points > 1 && props.pannable) {
            let panSpeed = 1e-3;
            switch (typeof props.panSpeed) {
                case 'function':
                    panSpeed = props.panSpeed(cameraState.getDistance());
                    break;

                case 'number':
                    panSpeed = props.panSpeed;
                    break;
            }
            cameraState.pan(
                drag.last.y * TOUCH_PAN_SENSITIVITY * panSpeed,
                -drag.last.x * TOUCH_PAN_SENSITIVITY * panSpeed,
                props.panPlaneNormal,
            );
            updateCamera();
            return;
        }

        const dpitch = -drag.last.y * (Math.PI / 1000);
        const dyaw = -drag.last.x * (Math.PI / 1000);

        cameraState.updateRotationWithInertia(dyaw, dpitch);
        updateCamera();
    });
    useEventListener(gestures.dragEnd, () => {
        cameraState.release();
        updateCamera();
    });

    let distanceWhenPinchStarted = 0;
    useEventListener(gestures.pinchStart, () => {
        distanceWhenPinchStarted = cameraState.getDistance();
    });
    useEventListener(gestures.pinch, (pinch) => {
        const { minDistance = 0, maxDistance } = props;
        const newDistance = (PINCH_ZOOM_SENSITIVITY * distanceWhenPinchStarted) / pinch.total.scale;

        cameraState.setDistance(Math.max(minDistance, Math.min(newDistance, maxDistance ?? Infinity)));

        updateCamera();
    });

    const handleZoom = (ev: WheelEvent) => {
        const { minDistance = 0, maxDistance } = props;
        const distanceScaling = maxDistance === undefined ? minDistance : (maxDistance - minDistance) / 100;
        const d = ev.deltaY * ZOOM_SENSITIVITY * distanceScaling;

        cameraState.setDistance(
            Math.max(props.minDistance ?? 0, Math.min(cameraState.getDistance() + d, props.maxDistance ?? Infinity)),
        );

        updateCamera();
    };

    createEffect(() => {
        if (props.targetX !== undefined || props.targetY !== undefined || props.targetZ !== undefined) {
            updateCamera();
        }
    });

    onMount(() => {
        updateCamera();

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
