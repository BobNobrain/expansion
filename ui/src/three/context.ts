import { createContext, useContext } from 'solid-js';
import { type WebGLRenderer, type Camera, type Scene } from 'three';
import { type Listenable } from '@/lib/event';
import { type TouchGestureManager } from '@/lib/gestures/TouchGestureManager';
import { type AnimationFrameData } from './types';

export type SceneRendererContext = {
    renderer: () => WebGLRenderer | null;
    canvas: () => HTMLCanvasElement;
    animation: Listenable<AnimationFrameData>;

    getBounds: () => DOMRect;
    getMainCamera: () => Camera | null;
    setMainCamera: (c: Camera) => void;

    scene: () => Scene;

    gestures: TouchGestureManager;
};

const outOfContext = () => {
    throw new Error('SceneRendererContext: tried to render three component outside of SceneRenderer!');
};

export const SceneRendererContext = createContext<SceneRendererContext>({
    renderer: outOfContext,
    canvas: outOfContext,
    animation: {
        on: outOfContext,
        off: outOfContext,
    },
    getBounds: outOfContext,
    getMainCamera: outOfContext,
    setMainCamera: outOfContext,
    scene: outOfContext,
    get gestures() {
        return outOfContext();
    },
});

export const useSceneRenderer = () => useContext(SceneRendererContext);
