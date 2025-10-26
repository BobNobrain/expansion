import { type Setter } from 'solid-js';
import { useControlledAnimation } from '../hooks/useAnimation';
import { type CameraOrbit } from './state';

export type OrbitInertia = {
    setInertia: (dyaw: number, dpitch: number, dt: number) => void;
    enable: () => void;
    disable: () => void;
};

export type OrbitInertiaOptions = {
    drag?: number;
    /** Radians per second */
    maxYawSpeed?: number;
    /** Radians per second */
    maxPitchSpeed?: number;
};

const EPS = 1e-3;
const DELTA_MOVEMENT_VELOCITY_FACTOR = 1e4;

export function createOrbitInertia(
    setOrbit: Setter<CameraOrbit>,
    { drag = 0.98, maxPitchSpeed = 0.3, maxYawSpeed = 1 }: OrbitInertiaOptions = {},
): OrbitInertia {
    const inertia: { yaw: number; pitch: number; enabled: boolean } = { yaw: 0, pitch: 0, enabled: false };

    const animation = useControlledAnimation(({ dt }) => {
        if (!inertia.enabled) {
            inertia.yaw = 0;
            inertia.pitch = 0;
            animation.stop();
            return;
        }

        const dtSeconds = dt * 1e-3;
        const deltaYaw = inertia.yaw * dtSeconds;
        const deltaPitch = inertia.pitch * dtSeconds;

        if (Math.abs(deltaYaw) < EPS) {
            inertia.yaw = 0;
        }
        if (Math.abs(deltaPitch) < EPS) {
            inertia.pitch = 0;
        }
        if (inertia.yaw === 0 && inertia.pitch === 0) {
            inertia.enabled = false;
            return;
        }

        // TODO: drag should include dt for proper FPS-independent animation
        inertia.yaw *= drag;
        inertia.pitch *= drag;

        setOrbit((old) => ({ ...old, pitch: old.pitch + deltaPitch, yaw: old.yaw + deltaYaw }));
    });

    return {
        setInertia: (dyaw, dpitch, dt) => {
            const dtSeconds = dt * 1e-3;
            inertia.yaw = (dyaw / dtSeconds) * DELTA_MOVEMENT_VELOCITY_FACTOR;
            inertia.yaw = Math.max(-maxYawSpeed, Math.min(inertia.yaw, maxYawSpeed));

            inertia.pitch = (dpitch / dtSeconds) * DELTA_MOVEMENT_VELOCITY_FACTOR;
            inertia.pitch = Math.max(-maxPitchSpeed, Math.min(inertia.pitch, maxPitchSpeed));
        },
        enable: () => {
            inertia.enabled = true;
            animation.start();
        },
        disable: () => {
            inertia.enabled = false;
        },
    };
}
