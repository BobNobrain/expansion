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
    Closed,
    Open,
    Minimized,
}

export type WindowAttributes = {
    minimizable: boolean;
    constrainWidth: NumericLimits;
    constrainHeight: NumericLimits;
};
