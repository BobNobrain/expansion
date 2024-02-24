import { type Point2D } from '../math/2d';

const LONG_TAP_TIME_MS = 1000;
const MOVE_THRESHOLD_PX_SQUARED = 25;

export function isMoveThresholdReached({ x, y }: Point2D): boolean {
    return x * x + y * y >= MOVE_THRESHOLD_PX_SQUARED;
}

export function isLongTap(durationMs: number) {
    return durationMs >= LONG_TAP_TIME_MS;
}
