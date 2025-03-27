import { createEffect, createSignal, type Setter } from 'solid-js';
import { Vector3, type Object3D } from 'three';
import { type RawVertex } from '../../../lib/3d/types';
import { lerp } from '../../../lib/math/misc';
import { Angle } from '../../../lib/math/angle';

export type CameraOrbit = {
    pitch: number;
    yaw: number;
    distance: number;
};

export type TargetedCameraState = {
    orbit: () => CameraOrbit;
    target: () => RawVertex;
};

export type TargetedCameraStateController = TargetedCameraState & {
    setOrbit: Setter<CameraOrbit>;
    setTarget: Setter<RawVertex>;
};

export type CreateTargetedCameraStateOptions = {
    initialPosition: CameraOrbit;
    initialTarget: RawVertex;
};

const PITCH_MIN = 0.087; // ~5deg
const PITCH_MAX = Math.PI - PITCH_MIN;

export function createTargetedCameraState(opts: CreateTargetedCameraStateOptions): TargetedCameraStateController {
    const [orbit, setOrbit] = createSignal<CameraOrbit>(opts.initialPosition);
    const [target, setTarget] = createSignal<RawVertex>(opts.initialTarget);

    return {
        orbit,
        setOrbit: (valueOrUpdater) =>
            setOrbit((old) => {
                const newValue = typeof valueOrUpdater === 'function' ? valueOrUpdater(old) : valueOrUpdater;
                const clampedPitch = Math.max(PITCH_MIN, Math.min(newValue.pitch, PITCH_MAX));
                if (clampedPitch !== newValue.pitch) {
                    return { ...newValue, pitch: clampedPitch };
                }
                return newValue;
            }),
        target,
        setTarget,
    };
}

export function createTargetedCameraStateBinding(state: TargetedCameraState, camera: () => Object3D | null) {
    createEffect(() => {
        const cam = camera();
        if (!cam) {
            return;
        }

        const { distance, pitch, yaw } = state.orbit();
        const [tx, ty, tz] = state.target();

        cam.position.setFromSphericalCoords(distance, pitch, yaw).add(new Vector3(tx, ty, tz));
        cam.lookAt(tx, ty, tz);
    });
}

export function interpolateCameraOrbits(from: CameraOrbit, to: CameraOrbit, progress: number): CameraOrbit {
    const yawFrom = Angle.normalize(from.yaw);
    let yawTo = Angle.normalize(to.yaw);
    if (yawTo - yawFrom > Math.PI) {
        yawTo -= Math.PI * 2;
    } else if (yawFrom - yawTo > Math.PI) {
        yawTo += Math.PI * 2;
    }

    return {
        yaw: lerp(yawFrom, yawTo, progress),
        pitch: lerp(from.pitch, to.pitch, progress),
        distance: lerp(from.distance, to.distance, progress),
    };
}
