import { createSignal } from 'solid-js';
import { type Size2D } from '../../../lib/math/types';
import { type WindowController, type WindowManagerController, type WindowManagerControllerPrivate } from './types';
import { createWindowController } from './window';

export type CreateWindowManagerOptions = {
    getSize: () => Size2D;
};

export function createWindowManagerController(options: CreateWindowManagerOptions): WindowManagerController {
    const [getWindows, setWindows] = createSignal<WindowController[]>([]);

    const wm: WindowManagerControllerPrivate = {
        createWindow: (cwOpts) => {
            return createWindowController(wm, cwOpts);
        },
        attachWindow: (wc) => {
            setWindows((old) => [...old, wc]);
        },
        detachWindow: (target) => {
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
