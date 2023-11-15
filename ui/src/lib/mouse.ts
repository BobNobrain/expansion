export const MouseButton = {
    Left: 0,
    Wheel: 1,
    Right: 2,
    Extra1: 3,
    Extra2: 4,
} as const;

export type MouseButton = (typeof MouseButton)[keyof typeof MouseButton];
