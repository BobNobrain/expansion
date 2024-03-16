import { type Point2D } from '../math/2d';

export type TapGestureData = {
    screen: Point2D;
    page: Point2D;
    client: Point2D;
    durationMs: number;
};

export type TapGestureHandlers = {
    onTap: (data: TapGestureData) => void;
};

export type LongTapGestureHandlers = {
    onLongTap: (data: TapGestureData) => void;
};

export type DragGestureData = {
    total: Point2D;
    last: Point2D;
    points: number;
};

export type DragGestureHandlers = {
    onDragStart: (data: DragGestureData) => void;
    onDrag: (data: DragGestureData) => void;
    onDragEnd: () => void;
};

export type Pinch = {
    tilt: number;
    scale: number;
};

export type PinchGestureData = {
    total: Pinch;
    last: Pinch;
};

export type PinchGestureHandlers = {
    onPinchStart: (data: PinchGestureData) => void;
    onPinch: (data: PinchGestureData) => void;
    onPinchEnd: () => void;
};

export type TouchPosition = {
    readonly time: number;
    readonly screen: Readonly<Point2D>;
    readonly page: Readonly<Point2D>;
    readonly client: Readonly<Point2D>;
};
