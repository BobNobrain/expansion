import { onCleanup, onMount, type Setter } from 'solid-js';
import { useDrag } from '../../../lib/solid/drag';
import { useEventListener } from '../../../lib/solid/useEventListener';
import { useSceneRenderer } from '../context';
import { type CameraOrbit } from './state';
import { type OrbitInertia } from './inertia';

export type OrbitControlsOptions = {
    pannable?: boolean;
    inertia?: OrbitInertia;
    onAssumedControl?: () => void;
};

const INERTIA_TIMEOUT = 100;
const MOUSE_DRAG_SENSITIVITY = 1000;
const TOUCH_DRAG_SENSITIVITY = 1000;

export function useOrbitControls(setOrbit: Setter<CameraOrbit>, opts: OrbitControlsOptions = {}) {
    const { canvas, gestures } = useSceneRenderer();

    const updateRotationWithInertia = (dyaw: number, dpitch: number, dt: number) => {
        setOrbit((old) => ({ ...old, yaw: old.yaw + dyaw, pitch: old.pitch + dpitch }));
        opts.inertia?.setInertia(dyaw, dpitch, dt);
    };

    let lastDragEventTime: DOMHighResTimeStamp = -1;

    const { handlers } = useDrag({
        onStart: () => {
            opts.inertia?.disable();
            opts.onAssumedControl?.();
            lastDragEventTime = performance.now();
        },
        onDrag: (ev) => {
            const dpitch = -ev.last.y * (Math.PI / MOUSE_DRAG_SENSITIVITY);
            const dyaw = -ev.last.x * (Math.PI / MOUSE_DRAG_SENSITIVITY);

            const now = performance.now();
            updateRotationWithInertia(dyaw, dpitch, now - lastDragEventTime);
            lastDragEventTime = now;
        },
        onEnd: () => {
            if (performance.now() - lastDragEventTime < INERTIA_TIMEOUT) {
                opts.inertia?.enable();
            }
        },
    });

    useEventListener(gestures.dragStart, () => {
        opts.inertia?.disable();
        opts.onAssumedControl?.();
        lastDragEventTime = performance.now();
    });
    useEventListener(gestures.drag, (drag) => {
        if (drag.points > 1 && opts.pannable) {
            return;
        }

        const dpitch = -drag.last.y * (Math.PI / TOUCH_DRAG_SENSITIVITY);
        const dyaw = -drag.last.x * (Math.PI / TOUCH_DRAG_SENSITIVITY);

        const now = performance.now();
        updateRotationWithInertia(dyaw, dpitch, now - lastDragEventTime);
        lastDragEventTime = now;
    });
    useEventListener(gestures.dragEnd, () => {
        if (performance.now() - lastDragEventTime < INERTIA_TIMEOUT) {
            opts.inertia?.enable();
        }
    });

    onMount(() => {
        const c = canvas();

        c.addEventListener('mousedown', handlers.onMouseDown);
        c.addEventListener('mouseup', handlers.onMouseUp);

        onCleanup(() => {
            c.removeEventListener('mousedown', handlers.onMouseDown);
            c.removeEventListener('mouseup', handlers.onMouseUp);
        });
    });
}
