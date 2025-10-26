import { createSignal } from 'solid-js';
import type { TouchGestureManager } from '../../lib/gestures/TouchGestureManager';

type ViewportScaleOptions = {
    gm: TouchGestureManager;
};

type UseViewportScaleResult = {
    getScale: () => number;
    onWheel: (ev: WheelEvent) => void;
};

const MIN_SCALE = 0.25;
const MAX_SCALE = 4.0;

export function useViewportScale({ gm }: ViewportScaleOptions): UseViewportScaleResult {
    const [getScale, setScale] = createSignal(1);

    const onWheel = (ev: WheelEvent) => {
        const delta = ev.deltaY;
        if (delta === 0) {
            return;
        }

        ev.preventDefault();

        setScale((old) => {
            if (delta > 0) {
                return Math.max(old / 2, MIN_SCALE);
            }

            return Math.min(old * 2, MAX_SCALE);
        });
    };

    return { getScale, onWheel };
}
