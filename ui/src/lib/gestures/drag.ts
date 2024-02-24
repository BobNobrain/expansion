import { type Triggerable } from '../event';
import { Point2D } from '../math/2d';
import { Detector } from './Detector';
import { type TouchTracker, getPositionsDelta } from './TouchTracker';
import { isMoveThresholdReached } from './thresholds';
import { type DragGestureData } from './types';

enum State {
    Inactive,
    Active,
}

export class DragDetector extends Detector {
    private state = State.Inactive;

    constructor(
        private tracker: TouchTracker,
        private dragStart: Triggerable<DragGestureData>,
        private drag: Triggerable<DragGestureData>,
        private dragEnd: Triggerable<void>,
    ) {
        super();

        this.tap(this.tracker.updated, () => {
            const trajectories = [this.tracker.getPrimary(), this.tracker.getSecondary()].filter(
                Boolean as unknown as <T>(t: T | null) => t is T,
            );

            if (this.state === State.Inactive) {
                // check until we move past the threshold
                const totalMovements = trajectories.map((t) => getPositionsDelta(t.current, t.start).screen);
                const avg = Point2D.avg(totalMovements);

                if (!isMoveThresholdReached(avg)) {
                    return;
                }

                this.state = State.Active;
                this.dragStart.trigger({
                    total: avg,
                    last: avg,
                });
                this.drag.trigger({
                    total: avg,
                    last: avg,
                });
                return;
            }

            // state === State.Active
            const totalMovements = trajectories.map((t) => getPositionsDelta(t.current, t.start).screen);
            const lastMovements = trajectories.map((t) => getPositionsDelta(t.current, t.previous).screen);
            const avgTotal = Point2D.avg(totalMovements);
            const avgLast = Point2D.avg(lastMovements);

            this.drag.trigger({
                total: avgTotal,
                last: avgLast,
            });
        });

        this.tap(this.tracker.finished, () => {
            if (this.state === State.Active) {
                this.dragEnd.trigger();
            }
            this.state = State.Inactive;
        });
    }
}
