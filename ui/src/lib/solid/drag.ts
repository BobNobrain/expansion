import { createSignal, onCleanup } from 'solid-js';
import { type Point2D } from '../math/types';
import { MouseButton } from '../mouse';

type DragState = {
    offset: Point2D;
    globalStart: Point2D;
    globalPrev: Point2D;
    active: boolean;
    element: HTMLElement;
};

export type UseDragResult = {
    isDragging: () => boolean;
    handlers: {
        onMouseDown: (ev: MouseEvent) => void;
        onMouseUp: (ev: MouseEvent) => void;
    };
};

export type OnDragEvent = {
    offset: Point2D;
    globalStart: Point2D;
    globalCurrent: Point2D;
    lastChange: Point2D;
};

export type DragOptions = {
    isEnabled?: () => boolean;
    onStart?: (ev: Pick<OnDragEvent, 'globalStart' | 'offset'>) => void;
    onDrag: (ev: OnDragEvent) => void;
    onEnd?: () => void;
};

const DRAG_START_THRESHOLD = 25;

export function useDrag({ onDrag, onEnd, onStart, isEnabled }: DragOptions): UseDragResult {
    const [isDragging, setIsDragging] = createSignal<boolean>(false);

    let state: DragState | null = null;

    const preventClicks = (ev: MouseEvent) => {
        ev.stopPropagation();
    };

    const onMove = (ev: MouseEvent) => {
        if (!state) {
            return;
        }

        const dx = ev.screenX - state.globalPrev.x;
        const dy = ev.screenY - state.globalPrev.y;

        if (!state.active) {
            if (dx * dx + dy * dy < DRAG_START_THRESHOLD) {
                return;
            }

            state.active = true;
            setIsDragging(true);
            onStart?.({
                globalStart: state.globalStart,
                offset: state.offset,
            });

            window.addEventListener('click', preventClicks, { capture: true });
        }

        onDrag({
            offset: state.offset,
            globalStart: state.globalStart,
            globalCurrent: { x: ev.screenX, y: ev.screenY },
            lastChange: { x: dx, y: dy },
        });
        state.globalPrev = { x: ev.screenX, y: ev.screenY };
    };

    const cleanup = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onRelease);

        setTimeout(() => window.removeEventListener('click', preventClicks, { capture: true }), 0);
        document.body.style.userSelect = 'auto';
    };

    const onRelease = (ev: MouseEvent) => {
        if (ev.button !== MouseButton.Left) {
            return;
        }

        setIsDragging(false);
        state = null;
        onEnd?.();

        cleanup();
    };

    onCleanup(cleanup);

    return {
        isDragging,
        handlers: {
            onMouseDown: (ev) => {
                if (ev.button !== MouseButton.Left || ev.altKey) {
                    return;
                }
                if (isEnabled && !isEnabled()) {
                    return;
                }

                state = {
                    offset: { x: ev.offsetX, y: ev.offsetY },
                    globalStart: { x: ev.screenX, y: ev.screenY },
                    globalPrev: { x: ev.screenX, y: ev.screenY },
                    element: ev.target as HTMLElement,
                    active: false,
                };

                ev.preventDefault();

                document.body.style.userSelect = 'none';
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onRelease);
            },
            onMouseUp: () => {
                if (!state || state.active) {
                    return;
                }

                state = null;
            },
        },
    };
}
