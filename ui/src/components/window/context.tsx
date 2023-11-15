import { createContext, useContext } from 'solid-js';
import { type WindowManagerController } from './controllers';

export type WindowManagerContext = () => WindowManagerController | null;
export const WindowManagerContext = createContext<WindowManagerContext>(() => null);

export const useWindowManager = () => useContext(WindowManagerContext);
