import { NumericLimits } from '../../../lib/math/numeric-limits';
import { type UseDragResult, useDrag } from '../../../lib/solid/drag';
import { type WindowController } from '../controllers';
import { type WindowPosition } from '../types';

export type WindowResizersOptions = {
    isResizeEnabled: () => boolean;
    controller: () => WindowController;
};

export type WindowResizers = {
    topEdge: UseDragResult;
    bottomEdge: UseDragResult;
    rightEdge: UseDragResult;
    leftEdge: UseDragResult;

    // topLeftCorner: UseDragResult;
    // topRightCorner: UseDragResult;
    // bottomLeftCorner: UseDragResult;
    // bottomRightCorner: UseDragResult;
};

export function useWindowResizers({ isResizeEnabled, controller }: WindowResizersOptions): WindowResizers {
    let posWhenStarted: Readonly<WindowPosition> = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
    };

    const onStart = () => {
        posWhenStarted = controller().getPosition();
    };

    const bottomEdge = useDrag({
        isEnabled: isResizeEnabled,
        onStart,
        onDrag(ev) {
            const dy = ev.globalCurrent.y - ev.globalStart.y;
            controller().updatePosition((pos) => ({
                ...pos,
                height: posWhenStarted.height + dy,
            }));
        },
    });

    const rightEdge = useDrag({
        isEnabled: isResizeEnabled,
        onStart,
        onDrag(ev) {
            const dx = ev.globalCurrent.x - ev.globalStart.x;
            controller().updatePosition((pos) => ({
                ...pos,
                width: posWhenStarted.width + dx,
            }));
        },
    });

    const leftEdge = useDrag({
        isEnabled: isResizeEnabled,
        onStart,
        onDrag(ev) {
            const dx = ev.globalCurrent.x - ev.globalStart.x;
            controller().updatePosition(
                (pos, attrs) => {
                    const delta = calculateBackwardDelta(
                        posWhenStarted.x,
                        posWhenStarted.width,
                        dx,
                        attrs.constrainX,
                        attrs.constrainWidth,
                    );
                    if (delta === 0) {
                        return pos;
                    }
                    return { ...pos, x: posWhenStarted.x + delta, width: posWhenStarted.width - delta };
                },
                { ignoreConstraints: true },
            );
        },
    });

    const topEdge = useDrag({
        isEnabled: isResizeEnabled,
        onStart,
        onDrag(ev) {
            const dy = ev.globalCurrent.y - ev.globalStart.y;
            controller().updatePosition(
                (pos, attrs) => {
                    const delta = calculateBackwardDelta(
                        posWhenStarted.y,
                        posWhenStarted.height,
                        dy,
                        attrs.constrainY,
                        attrs.constrainHeight,
                    );
                    if (delta === 0) {
                        console.log('delta 0!!');
                        return posWhenStarted;
                    }
                    return { ...pos, y: posWhenStarted.y + delta, height: posWhenStarted.height - delta };
                },
                { ignoreConstraints: true },
            );
        },
    });

    return {
        topEdge,
        bottomEdge,
        leftEdge,
        rightEdge,
    };
}

function calculateBackwardDelta(
    start: number,
    size: number,
    requestedDelta: number,
    startConstraint: NumericLimits,
    sizeConstraint: NumericLimits,
): number {
    const requestedNewStart = start + requestedDelta;
    const requestedNewSize = size - requestedDelta;
    const clampedNewStart = NumericLimits.clamp(requestedNewStart, startConstraint);
    const clampedNewSize = NumericLimits.clamp(requestedNewSize, sizeConstraint);
    const availableDeltaStart = clampedNewStart - start;
    const availableDeltaSize = size - clampedNewSize;

    return Math.abs(availableDeltaSize) < Math.abs(availableDeltaStart) ? availableDeltaSize : availableDeltaStart;
}
