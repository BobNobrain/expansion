import { onCleanup, onMount, type Setter } from 'solid-js';
import { useEventListener } from '@/lib/solid/useEventListener';
import { useSceneRenderer } from '../context';
import { type CameraOrbit } from './state';

export type ZoomOptions = {
    minDistance?: number;
    maxDistance?: number;
};

const ZOOM_SENSITIVITY = 0.1;
const PINCH_ZOOM_SENSITIVITY = 1;

export function useZoomControls(getOrbit: () => CameraOrbit, setOrbit: Setter<CameraOrbit>, opts: ZoomOptions = {}) {
    const { canvas, gestures } = useSceneRenderer();

    let distanceWhenPinchStarted = 0;
    useEventListener(gestures.pinchStart, () => {
        distanceWhenPinchStarted = getOrbit().distance;
    });
    useEventListener(gestures.pinch, (pinch) => {
        const { minDistance = 0, maxDistance } = opts;
        const newDistance = (PINCH_ZOOM_SENSITIVITY * distanceWhenPinchStarted) / pinch.total.scale;

        const newDistanceClamped = Math.max(minDistance, Math.min(newDistance, maxDistance ?? Infinity));
        setOrbit((old) => ({ ...old, distance: newDistanceClamped }));
    });

    const handleZoom = (ev: WheelEvent) => {
        const { minDistance = 0, maxDistance } = opts;
        const distanceScaling = maxDistance === undefined ? minDistance : (maxDistance - minDistance) / 100;
        const d = ev.deltaY * ZOOM_SENSITIVITY * distanceScaling;

        setOrbit((old) => {
            const newDistanceClamped = Math.max(minDistance, Math.min(old.distance + d, maxDistance ?? Infinity));

            return { ...old, distance: newDistanceClamped };
        });
    };

    onMount(() => {
        const c = canvas();

        c.addEventListener('wheel', handleZoom);

        onCleanup(() => {
            c.removeEventListener('wheel', handleZoom);
        });
    });
}
