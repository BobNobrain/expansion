import { type NumericLimits } from '../../lib/math/numeric-limits';

export type WindowPosition = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type WindowTitle = {
    text: string;
};

export enum WindowState {
    Normal,
    Minimized,
}

export type WindowAttributes = {
    minimizable: boolean;
    constrainX: NumericLimits;
    constrainY: NumericLimits;
    constrainWidth: NumericLimits;
    constrainHeight: NumericLimits;
};
