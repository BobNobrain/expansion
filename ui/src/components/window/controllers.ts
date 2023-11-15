import { type Component, createSignal } from 'solid-js';
import { type WindowTitle, type WindowPosition, type WindowAttributes, WindowState } from './types';
import { NumericLimits } from '../../lib/math/numeric-limits';
import { type Size2D } from '../../lib/math/types';

const WINDOW_OVERFLOW_PADDING = 26;
const WINDOW_CONTROLS_SIZE = 32;
const WINDOW_HEADER_HEIGHT = 16;

export type WindowManagerController = {
    createWindow(options: CreateWindowOptions): WindowController;
    destroyWindow(window: WindowController): void;

    getWindows(): WindowController[];

    bringOnTop(window: WindowController): void;

    getSize(): Size2D;
};

export type WindowController = {
    getWindowState(): WindowState;
    setWindowState(value: WindowState | ((old: WindowState) => WindowState)): void;

    getPosition(): WindowPosition;
    setPosition(pos: Partial<WindowPosition>): void;
    updatePosition(
        f: (oldPos: WindowPosition, attrs: WindowAttributes) => WindowPosition,
        opts?: { ignoreConstraints?: boolean },
    ): void;

    getTitle(): WindowTitle;
    setTitle(title: WindowTitle): void;

    getContent(): Component;

    getAttributes(): WindowAttributes;
    setAttributes(attrs: Partial<WindowAttributes>): void;

    destroy(): void;
    bringOnTop(): void;
};

export type CreateWindowManagerOptions = {
    getSize: () => Size2D;
};

export function createWindowManagerController(options: CreateWindowManagerOptions): WindowManagerController {
    const [getWindows, setWindows] = createSignal<WindowController[]>([]);

    const wm: WindowManagerController = {
        createWindow: (cwOpts) => {
            const w = createWindowController(wm, cwOpts);
            setWindows((ws) => [...ws, w]);
            return w;
        },
        destroyWindow: (target) => {
            setWindows((ws) => ws.filter((w) => w !== target));
        },
        getWindows,
        getSize: options.getSize,
        bringOnTop: (target) => {
            setWindows((ws) => {
                const newVal = ws.filter((w) => w !== target);
                newVal.unshift(target);
                return newVal;
            });
        },
    };
    return wm;
}

export type CreateWindowOptions = {
    title: WindowTitle;
    attributes?: Partial<Omit<WindowAttributes, 'constrainX' | 'constrainY'>>;
    position?: Partial<WindowPosition>;
    state?: WindowState;
    content: Component;
};

export function createWindowController(
    manager: WindowManagerController,
    options: CreateWindowOptions,
): WindowController {
    const size = manager.getSize();
    const [getWindowState, setWindowState] = createSignal(WindowState.Normal);

    const constrainWidth = NumericLimits.intersect(options.attributes?.constrainWidth, { min: 0, max: size.width });
    const constrainHeight = NumericLimits.intersect(options.attributes?.constrainHeight, { min: 0, max: size.height });

    const { initialPos, constrainX, constrainY } = getInitialPosition(
        size,
        constrainWidth,
        constrainHeight,
        options.position,
    );

    const [getPosition, setWholePosition] = createSignal<WindowPosition>(initialPos);
    const updatePosition: WindowController['updatePosition'] = (f, opts) =>
        setWholePosition((oldPos) => {
            const attrs = getAttributes();
            const newPos = f(oldPos, attrs);

            if (!opts?.ignoreConstraints) {
                newPos.x = NumericLimits.clamp(newPos.x, attrs.constrainX);
                newPos.y = NumericLimits.clamp(newPos.y, attrs.constrainY);
                newPos.width = NumericLimits.clamp(newPos.width, attrs.constrainWidth);
                newPos.height = NumericLimits.clamp(newPos.height, attrs.constrainHeight);
            }

            const newLimits = getCoordConstraintsFromSize(newPos, manager.getSize());
            setXConstraint((old) => (NumericLimits.eq(old, newLimits.x) ? old : newLimits.x));
            setYConstraint((old) => (NumericLimits.eq(old, newLimits.y) ? old : newLimits.y));

            return newPos;
        });

    const setPosition = (pos: Partial<WindowPosition>) => updatePosition((value) => ({ ...value, ...pos }));

    const [getTitle, setTitle] = createSignal<WindowTitle>(options.title);

    const [isMinimizable, setIsMinimizable] = createSignal<boolean>(options.attributes?.minimizable ?? false);
    const [getXConstraint, setXConstraint] = createSignal<NumericLimits>(constrainX);
    const [getYConstraint, setYConstraint] = createSignal<NumericLimits>(constrainY);
    const [getWidthConstraint, setWidthConstraint] = createSignal<NumericLimits>(constrainWidth);
    const [getHeightConstraint, setHeightConstraint] = createSignal<NumericLimits>(constrainHeight);
    const getAttributes = (): WindowAttributes => {
        return {
            minimizable: isMinimizable(),
            constrainX: getXConstraint(),
            constrainY: getYConstraint(),
            constrainWidth: getWidthConstraint(),
            constrainHeight: getHeightConstraint(),
        };
    };
    const setAttributes = (attrs: Partial<WindowAttributes>) => {
        if (attrs.minimizable) {
            setIsMinimizable(attrs.minimizable);
        }
        if (attrs.constrainX) {
            setXConstraint(attrs.constrainX);
        }
        if (attrs.constrainY) {
            setYConstraint(attrs.constrainY);
        }
        if (attrs.constrainWidth) {
            setWidthConstraint(attrs.constrainWidth);
        }
        if (attrs.constrainHeight) {
            setHeightConstraint(attrs.constrainHeight);
        }
    };

    const wc: WindowController = {
        getWindowState,
        setWindowState,

        getPosition,
        setPosition,

        updatePosition,

        getTitle,
        setTitle,

        getAttributes,
        setAttributes,

        destroy: () => manager.destroyWindow(wc),
        bringOnTop: () => manager.bringOnTop(wc),

        getContent: () => options.content,
    };
    return wc;
}

function getCoordConstraintsFromSize(windowSize: Size2D, canvasSize: Size2D): { x: NumericLimits; y: NumericLimits } {
    const x: NumericLimits = {
        min: -windowSize.width + WINDOW_OVERFLOW_PADDING + WINDOW_CONTROLS_SIZE,
        max: canvasSize.width - WINDOW_OVERFLOW_PADDING,
    };
    const y: NumericLimits = {
        min: -WINDOW_HEADER_HEIGHT / 2,
        max: canvasSize.height + WINDOW_HEADER_HEIGHT / 2,
    };

    return { x, y };
}

function getInitialPosition(
    canvas: Size2D,
    constrainWidth: NumericLimits,
    constrainHeight: NumericLimits,
    presetPos: Partial<WindowPosition> = {},
): { initialPos: WindowPosition; constrainX: NumericLimits; constrainY: NumericLimits } {
    const w = NumericLimits.clamp(presetPos.width ?? canvas.width / 2, constrainWidth);
    const h = NumericLimits.clamp(presetPos.height ?? canvas.height / 2, constrainHeight);

    const { x: constrainX, y: constrainY } = getCoordConstraintsFromSize({ width: w, height: h }, canvas);

    const x = NumericLimits.clamp(presetPos.x ?? (canvas.width - w) / 2, constrainX);
    const y = NumericLimits.clamp(presetPos.y ?? (canvas.height - h) / 2, constrainY);

    const initialPos: WindowPosition = { x, y, width: w, height: h };

    return { initialPos, constrainX, constrainY };
}
