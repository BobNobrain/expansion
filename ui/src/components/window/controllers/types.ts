import { type Component } from 'solid-js';
import { type NumericLimits } from '../../../lib/math/numeric-limits';
import { type Size2D } from '../../../lib/math/types';
import { type Signalify } from '../../../lib/solid/types';
import { type WindowTitle, type WindowPosition, type WindowAttributes, type WindowState } from '../types';

export type WindowManagerController = {
    createWindow(options: CreateWindowOptions): WindowController;
    getWindows(): WindowController[];
};

export type WindowManagerControllerPrivate = WindowManagerController & {
    attachWindow(window: WindowController): void;
    detachWindow(window: WindowController): void;
    bringOnTop(window: WindowController): void;
    getSize(): Size2D;
};

export type CoordConstraints = {
    x: NumericLimits;
    y: NumericLimits;
};

export type WindowController = {
    getWindowState(): WindowState;
    setMinimized(value: boolean | ((wasMinimized: boolean) => boolean)): void;

    getPosition(): WindowPosition;
    setPosition(pos: Partial<WindowPosition>): void;
    updatePosition(
        f: (oldPos: WindowPosition, attrs: Signalify<WindowAttributes>, cc: () => CoordConstraints) => WindowPosition,
        opts?: { ignoreConstraints?: boolean },
    ): void;

    getTitle(): WindowTitle;
    setTitle(title: WindowTitle): void;

    getContent(): Component;

    getAttributes(): Signalify<WindowAttributes>;
    setAttributes(attrs: Partial<WindowAttributes>): void;

    open(): void;
    close(): void;
    isOpen(): boolean;
    bringOnTop(): void;
};

export type CreateWindowOptions = {
    title: WindowTitle;
    attributes?: Partial<Omit<WindowAttributes, 'constrainX' | 'constrainY'>>;
    position?: Partial<WindowPosition>;
    state?: WindowState;
    content: Component;
};
