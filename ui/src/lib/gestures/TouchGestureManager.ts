import { type Listenable, createEvent } from '../event';
import { TouchTracker } from './TouchTracker';
import { DragDetector } from './drag';
import { PinchDetector } from './pinch';
import { TapDetector } from './tap';
import { type DragGestureData, type PinchGestureData, type TapGestureData } from './types';

export type TouchGestureManager = {
    readonly tap: Listenable<TapGestureData>;
    readonly longTap: Listenable<TapGestureData>;

    readonly dragStart: Listenable<DragGestureData>;
    readonly drag: Listenable<DragGestureData>;
    readonly dragEnd: Listenable<void>;

    readonly pinchStart: Listenable<PinchGestureData>;
    readonly pinch: Listenable<PinchGestureData>;
    readonly pinchEnd: Listenable<void>;

    attach(el: HTMLElement): void;
    detach(): void;
    destroy(): void;
};

class TouchGestureManagerImpl implements TouchGestureManager {
    readonly tap = createEvent<TapGestureData>();
    readonly longTap = createEvent<TapGestureData>();

    readonly dragStart = createEvent<DragGestureData>();
    readonly drag = createEvent<DragGestureData>();
    readonly dragEnd = createEvent<void>();

    readonly pinchStart = createEvent<PinchGestureData>();
    readonly pinch = createEvent<PinchGestureData>();
    readonly pinchEnd = createEvent<void>();

    private isEmpty(): boolean {
        return (
            !this.tap.length() &&
            !this.longTap.length() &&
            !this.dragStart.length() &&
            !this.drag.length() &&
            !this.dragEnd.length() &&
            !this.pinchStart.length() &&
            !this.pinch.length() &&
            !this.pinchEnd.length()
        );
    }

    private target: HTMLElement | null = null;

    private tracker = new TouchTracker();
    private tapDetector = new TapDetector(this.tracker, this.tap, this.longTap);
    private dragDetector = new DragDetector(this.tracker, this.dragStart, this.drag, this.dragEnd);
    private pinchDetector = new PinchDetector(this.tracker, this.pinchStart, this.pinch, this.pinchEnd);

    private handleTouchStart = (startEvent: TouchEvent) => {
        if (!this.tracker.hasActiveTrajectories() && this.isEmpty()) {
            return;
        }

        startEvent.preventDefault();
        this.tracker.onTouchStart(startEvent);
    };

    private handleTouchMove = (ev: TouchEvent) => {
        ev.preventDefault();
        this.tracker.onTouchMove(ev);
    };

    private handleTouchEnd = (ev: TouchEvent) => {
        ev.preventDefault();
        this.tracker.onTouchEnd(ev);
    };

    attach(target: HTMLElement) {
        this.target = target;

        this.target.addEventListener('touchstart', this.handleTouchStart);

        this.tracker.started.on(() => {
            this.target!.addEventListener('touchmove', this.handleTouchMove);
            this.target!.addEventListener('touchend', this.handleTouchEnd);
            this.target!.addEventListener('touchcancel', this.handleTouchEnd);
        });

        this.tracker.finished.on(() => {
            this.target!.removeEventListener('touchmove', this.handleTouchMove);
            this.target!.removeEventListener('touchend', this.handleTouchEnd);
            this.target!.removeEventListener('touchcancel', this.handleTouchEnd);
        });
    }
    detach() {
        if (!this.target) {
            return;
        }
        this.target.removeEventListener('touchstart', this.handleTouchStart);

        // just in case
        this.target.removeEventListener('touchmove', this.handleTouchMove);
        this.target.removeEventListener('touchend', this.handleTouchEnd);
        this.target.removeEventListener('touchcancel', this.handleTouchEnd);

        this.target = null;
    }

    debugPinch() {
        this.tracker.started.on(() => console.log('started'));
        this.tracker.multitouched.on(() => console.log('multitouched'));
        this.tracker.finished.on(() => console.log('finished'));

        this.longTap.on((tap) => {
            console.log('DEBUG PINCH: setting a ghost finger', tap);

            this.handleTouchStart({
                preventDefault: () => {},
                changedTouches: [
                    {
                        id: Math.random(),
                        clientX: tap.client.x,
                        clientY: tap.client.y,
                        pageX: tap.page.x,
                        pageY: tap.page.y,
                        screenX: tap.screen.x,
                        screenY: tap.screen.y,
                    },
                ],
            } as never);
        });
    }

    destroy() {
        this.detach();

        this.tapDetector.destroy();
        this.dragDetector.destroy();
        this.pinchDetector.destroy();
    }
}

export function createTouchGestureManager(): TouchGestureManager {
    return new TouchGestureManagerImpl();
}
