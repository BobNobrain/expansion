import { type Triggerable } from '../event';
import { Point2D } from '../math/2d';
import { Detector } from './Detector';
import { getPositionsDelta, type TouchTracker, type TouchTrajectory } from './TouchTracker';
import { isMoveThresholdReached } from './thresholds';
import { type PinchGestureData, type Pinch } from './types';

enum State {
    Inactive,
    MultitouchStarted,
    InProgress,
}

export class PinchDetector extends Detector {
    private state = State.Inactive;

    constructor(
        private tracker: TouchTracker,
        private pinchStart: Triggerable<PinchGestureData>,
        private pinch: Triggerable<PinchGestureData>,
        private pinchEnd: Triggerable<void>,
    ) {
        super();

        this.tap(this.tracker.multitouched, () => {
            const primary = this.tracker.getPrimary();
            const secondary = this.tracker.getSecondary();

            if (!primary || !secondary) {
                // that should not happen
                console.log('MT: !primary || !secondary', { primary, secondary });
                return;
            }

            this.state = State.MultitouchStarted;
        });

        this.tap(this.tracker.updated, () => {
            if (this.state === State.Inactive) {
                return;
            }

            const primary = this.tracker.getPrimary();
            const secondary = this.tracker.getSecondary();

            if (this.state === State.MultitouchStarted) {
                if (!primary || !secondary) {
                    this.state = State.Inactive;
                    return;
                }

                const dp = getPositionsDelta(primary.current, primary.start);
                const ds = getPositionsDelta(secondary.current, secondary.start);
                if (!isMoveThresholdReached(dp.screen) && !isMoveThresholdReached(ds.screen)) {
                    console.log('UPD: thresholds not reached', { dp, ds });
                    return;
                }

                this.state = State.InProgress;
                const pinchData = calculatePinch(primary, secondary);
                this.pinchStart.trigger(pinchData);
                this.pinch.trigger(pinchData);
                return;
            }

            // State.InProgress
            if (!primary || !secondary) {
                this.pinchEnd.trigger();
                this.state = State.Inactive;
                return;
            }

            this.pinch.trigger(calculatePinch(primary, secondary));
        });

        this.tap(this.tracker.finished, () => {
            if (this.state === State.InProgress) {
                this.pinchEnd.trigger();
            }
            this.state = State.Inactive;
        });
    }
}

function calculatePinch(primary: TouchTrajectory, secondary: TouchTrajectory): PinchGestureData {
    const initial: Point2D = Point2D.diff(primary.start.screen, secondary.start.screen);
    const initialLength = Point2D.len(initial);

    const previous: Point2D = Point2D.diff(primary.previous.screen, secondary.previous.screen);
    const previousLength = Point2D.len(previous);

    const current: Point2D = Point2D.diff(primary.current.screen, secondary.current.screen);
    const currentLength = Point2D.len(current);

    const total: Pinch = {
        scale: currentLength / initialLength,
        tilt: Point2D.angle(initial, current),
    };
    const last: Pinch = {
        scale: currentLength / previousLength,
        tilt: Point2D.angle(previous, current),
    };

    return {
        total,
        last,
    };
}
