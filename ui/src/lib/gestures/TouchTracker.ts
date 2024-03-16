import { createEvent } from '../event';
import { Point2D } from '../math/2d';
import { type TouchPosition } from './types';

export type TouchTrajectory = {
    id: number;
    start: TouchPosition;
    current: TouchPosition;
    previous: TouchPosition;
};

export const getPositionsDelta = (last: TouchPosition, first: TouchPosition): TouchPosition => {
    return {
        time: last.time - first.time,
        client: Point2D.diff(last.client, first.client),
        page: Point2D.diff(last.page, first.page),
        screen: Point2D.diff(last.screen, first.screen),
    };
};

const getPosition = (touch: Touch): TouchPosition => ({
    time: performance.now(),
    client: { x: touch.clientX, y: touch.clientY },
    page: { x: touch.pageX, y: touch.pageY },
    screen: { x: touch.screenX, y: touch.screenY },
});

const startTrajectory = (touch: Touch): TouchTrajectory => {
    const pos = getPosition(touch);
    return {
        id: touch.identifier,
        start: pos,
        current: pos,
        previous: pos,
    };
};

const updateTrajectory = (touch: Touch, trajectory: TouchTrajectory) => {
    const pos = getPosition(touch);
    trajectory.previous = trajectory.current;
    trajectory.current = pos;
};

export class TouchTracker {
    private activeTrajectories: TouchTrajectory[] = [];
    private maxTrajectories = 0;

    started = createEvent<void>();
    multitouched = createEvent<void>();
    finished = createEvent<void>();
    updated = createEvent<void>();

    getPrimary(): TouchTrajectory | null {
        return this.activeTrajectories[0] ?? null;
    }
    getSecondary(): TouchTrajectory | null {
        return this.activeTrajectories[1] ?? null;
    }

    hasActiveTrajectories(): boolean {
        return this.activeTrajectories.length > 0;
    }

    getActiveTrajectoriesCount(): number {
        return this.activeTrajectories.length;
    }
    getMaxReachedTrajectoriesCount(): number {
        return this.maxTrajectories;
    }

    onTouchStart(ev: TouchEvent) {
        const justStarted = this.activeTrajectories.length === 0;

        for (const newTouch of ev.changedTouches) {
            this.activeTrajectories.push(startTrajectory(newTouch));
        }

        if (justStarted) {
            this.started.trigger();
        }

        if (this.activeTrajectories.length > 1 && this.maxTrajectories <= 1) {
            this.multitouched.trigger();
        }

        this.maxTrajectories = Math.max(this.maxTrajectories, this.activeTrajectories.length);

        this.updated.trigger();
    }

    onTouchMove(ev: TouchEvent) {
        this.processUpdates(ev);
        this.updated.trigger();
    }

    onTouchEnd(ev: TouchEvent) {
        this.processUpdates(ev);

        for (const finishedTouch of ev.changedTouches) {
            const id = finishedTouch.identifier;
            const index = this.trajectoryIdToIndex(id);

            if (index === -1) {
                continue;
            }

            this.activeTrajectories.splice(index, 1);
        }

        if (this.activeTrajectories.length === 0) {
            this.finished.trigger();
            this.maxTrajectories = 0;
        }
    }

    private processUpdates(ev: TouchEvent) {
        for (const updatedTouch of ev.changedTouches) {
            const id = updatedTouch.identifier;
            const index = this.trajectoryIdToIndex(id);

            if (index === -1) {
                continue;
            }

            updateTrajectory(updatedTouch, this.activeTrajectories[index]);
        }
    }

    private trajectoryIdToIndex(id: number): number {
        for (let i = 0; i < this.activeTrajectories.length; i++) {
            if (this.activeTrajectories[i].id === id) {
                return i;
            }
        }

        return -1;
    }
}
