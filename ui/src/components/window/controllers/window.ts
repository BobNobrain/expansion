import { createSignal } from 'solid-js';
import { NumericLimits } from '../../../lib/math/numeric-limits';
import { type Size2D } from '../../../lib/math/types';
import { type Signalify } from '../../../lib/solid/types';
import { type WindowAttributes, type WindowPosition, WindowState, type WindowTitle } from '../types';
import { type CreateWindowOptions, type WindowController, type WindowManagerControllerPrivate } from './types';

const WINDOW_OVERFLOW_PADDING = 26;
const WINDOW_CONTROLS_SIZE = 32;
const WINDOW_HEADER_HEIGHT = 16;

export function createWindowController(
    manager: WindowManagerControllerPrivate,
    options: CreateWindowOptions,
): WindowController {
    const size = manager.getSize();
    const [getWindowState, setWindowState] = createSignal(WindowState.Closed);

    const initialPos = getInitialPosition(
        size,
        NumericLimits.intersect(options.attributes?.constrainWidth, { min: 0, max: size.width }),
        NumericLimits.intersect(options.attributes?.constrainHeight, { min: 0, max: size.height }),
        options.position,
    );

    const [getPosition, setWholePosition] = createSignal<WindowPosition>(initialPos);

    const getCoordConstraints = () => getCoordConstraintsFromSize(getPosition(), manager.getSize());

    const updatePosition: WindowController['updatePosition'] = (f, opts) =>
        setWholePosition((oldPos) => {
            const attrs = getAttributes();
            const newPos = f(oldPos, attrs, getCoordConstraints);

            if (!opts?.ignoreConstraints) {
                const coordConstraints = getCoordConstraints();

                newPos.x = NumericLimits.clamp(newPos.x, coordConstraints.x);
                newPos.y = NumericLimits.clamp(newPos.y, coordConstraints.y);
                newPos.width = NumericLimits.clamp(newPos.width, attrs.constrainWidth());
                newPos.height = NumericLimits.clamp(newPos.height, attrs.constrainHeight());
            }

            return newPos;
        });

    const setPosition = (pos: Partial<WindowPosition>) => updatePosition((value) => ({ ...value, ...pos }));

    const [getTitle, setTitle] = createSignal<WindowTitle>(options.title);

    const [isMinimizable, setIsMinimizable] = createSignal<boolean>(options.attributes?.minimizable ?? false);
    const [getRawWidthConstraint, setRawWidthConstraint] = createSignal<NumericLimits>(
        options.attributes?.constrainWidth,
    );
    const [getRawHeightConstraint, setRawHeightConstraint] = createSignal<NumericLimits>(
        options.attributes?.constrainHeight,
    );

    const getWidthConstraint = () =>
        NumericLimits.intersect(getRawWidthConstraint(), { min: 0, max: manager.getSize().width });
    const getHeightConstraint = () =>
        NumericLimits.intersect(getRawHeightConstraint(), { min: 0, max: manager.getSize().height });

    const getAttributes = (): Signalify<WindowAttributes> => {
        return {
            minimizable: isMinimizable,
            constrainWidth: getWidthConstraint,
            constrainHeight: getHeightConstraint,
        };
    };
    const setAttributes = (attrs: Partial<WindowAttributes>) => {
        if (attrs.minimizable) {
            setIsMinimizable(attrs.minimizable);
        }
        if (attrs.constrainWidth) {
            setRawWidthConstraint(attrs.constrainWidth);
        }
        if (attrs.constrainHeight) {
            setRawHeightConstraint(attrs.constrainHeight);
        }
    };

    const restore = () => {
        console.log(getInitialPosition(manager.getSize(), getWidthConstraint(), getHeightConstraint()));
        console.log(manager.getSize(), getWidthConstraint(), getHeightConstraint());
        setWholePosition(getInitialPosition(manager.getSize(), getWidthConstraint(), getHeightConstraint()));
    };

    const wc: WindowController = {
        getWindowState,
        setMinimized(value) {
            setWindowState((oldState) => {
                if (oldState === WindowState.Closed) {
                    return oldState;
                }

                const shouldMinimize = typeof value === 'boolean' ? value : value(oldState === WindowState.Minimized);
                return shouldMinimize ? WindowState.Minimized : WindowState.Open;
            });
        },

        getPosition,
        setPosition,

        updatePosition,

        getTitle,
        setTitle,

        getAttributes,
        setAttributes,

        open: () => {
            manager.attachWindow(wc);
            restore();
            setWindowState(WindowState.Open);
        },
        close: () => {
            manager.detachWindow(wc);
            setWindowState(WindowState.Closed);
        },
        isOpen: () => getWindowState() !== WindowState.Closed,
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
): WindowPosition {
    const w = NumericLimits.clamp(presetPos.width ?? canvas.width / 2, constrainWidth);
    const h = NumericLimits.clamp(presetPos.height ?? canvas.height / 2, constrainHeight);

    const { x: constrainX, y: constrainY } = getCoordConstraintsFromSize({ width: w, height: h }, canvas);

    const x = NumericLimits.clamp(presetPos.x ?? (canvas.width - w) / 2, constrainX);
    const y = NumericLimits.clamp(presetPos.y ?? (canvas.height - h) / 2, constrainY);

    const initialPos: WindowPosition = { x, y, width: w, height: h };

    return initialPos;
}
