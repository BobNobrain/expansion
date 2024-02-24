import { type Triggerable } from '../event';
import { Detector } from './Detector';
import { isLongTap, isMoveThresholdReached } from './thresholds';
import { getPositionsDelta, type TouchTracker } from './TouchTracker';
import { type TapGestureData } from './types';

export class TapDetector extends Detector {
    constructor(
        private tracker: TouchTracker,
        private tapEvent: Triggerable<TapGestureData>,
        private longTap: Triggerable<TapGestureData>,
    ) {
        super();
        this.init();
    }

    init() {
        this.tap(this.tracker.started, () => {
            const p = this.tracker.getPrimary();
            if (!p) {
                return;
            }

            this.tap(this.tracker.multitouched, () => {
                // multitouch means this is definitely not a tap/long tap
                this.bail();
            });

            this.tap(this.tracker.updated, () => {
                if (isMoveThresholdReached(getPositionsDelta(p.current, p.start).screen)) {
                    // finger moved too far, this is not a tap
                    this.bail();
                }
            });

            this.tap(this.tracker.finished, () => {
                const time = performance.now() - p.start.time;

                if (isLongTap(time)) {
                    this.longTap.trigger({
                        durationMs: time,
                        client: p.start.client,
                        page: p.start.page,
                        screen: p.start.screen,
                    });
                } else {
                    this.tapEvent.trigger({
                        durationMs: time,
                        client: p.start.client,
                        page: p.start.page,
                        screen: p.start.screen,
                    });
                }

                // resubscribe for everything
                this.bail();
            });
        });
    }

    private bail() {
        this.destroy();
        this.init();
    }
}
