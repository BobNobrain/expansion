import { createEffect, untrack, type Component } from 'solid-js';
import { Spherical, Vector3 } from 'three';
import { type RawVertex } from '@/lib/3d/types';
import { PerspectiveCamera } from '@/three/PerspectiveCamera/PerspectiveCamera';
import { useSceneRenderer } from '@/three/context';
import { easeOut, useValueAnimator } from '@/three/hooks/useValueAnimator';
import {
    type CameraOrbit,
    createOrbitInertia,
    createTargetedCameraState,
    createTargetedCameraStateBinding,
    interpolateCameraOrbits,
    useOrbitControls,
    useZoomControls,
} from '@/three/TargetedCamera';

export type PVSCameraProps = {
    selectedTileCoords: RawVertex | null;
};

const ANIMATION_DURATION = 800;

export const PVSManualCamera: Component<PVSCameraProps> = (props) => {
    const state = createTargetedCameraState({
        initialPosition: props.selectedTileCoords
            ? calcOrbit(props.selectedTileCoords, 2)
            : { distance: 2, pitch: Math.PI / 2, yaw: 0 },
        initialTarget: [0, 0, 0],
    });

    const animator = useValueAnimator({
        getter: state.orbit,
        setter: state.setOrbit,
        interpolate: interpolateCameraOrbits,
        timeCurve: easeOut,
    });

    const inertia = createOrbitInertia(state.setOrbit);

    useOrbitControls(state.setOrbit, {
        pannable: false,
        inertia,
        onAssumedControl: animator.stopAnimation,
    });
    useZoomControls(state.orbit, state.setOrbit, {
        minDistance: 1.5,
        maxDistance: 2.5,
    });

    const { getMainCamera } = useSceneRenderer();
    createTargetedCameraStateBinding(state, getMainCamera);

    // Animating camera position to selected tile, if it's far from screen center
    createEffect(() => {
        const tileCoords = props.selectedTileCoords;
        if (!tileCoords) {
            return;
        }

        const camera = untrack(getMainCamera);
        if (!camera) {
            return;
        }

        const cameraLookNegative = camera.position.clone().normalize();
        const angleCos = cameraLookNegative.dot(new Vector3(...tileCoords));

        if (angleCos > 0.92) {
            // too small to rotate, bail out
            return;
        }

        const currentOrbit = untrack(state.orbit);
        const targetOrbit = calcOrbit(tileCoords, Math.max(1.7, Math.min(currentOrbit.distance, 2.1)));

        animator.startAnimation(targetOrbit, ANIMATION_DURATION);
    });

    return <PerspectiveCamera main fov={75} far={10} near={0.01} />;
};

function calcOrbit(v: RawVertex, distance: number): CameraOrbit {
    const s = new Spherical().setFromCartesianCoords(...v);
    const orbit: CameraOrbit = {
        distance,
        pitch: s.phi,
        yaw: s.theta,
    };
    return orbit;
}
