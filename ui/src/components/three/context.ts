import { createContext, useContext } from 'solid-js';
import { type WebGLRenderer, type Camera, type Scene } from 'three';
import { type Listenable } from '../../lib/event';
import { type AnimationFrameData } from './types';

export type SceneRendererContext = {
    renderer: () => WebGLRenderer | null;
    canvas: () => HTMLCanvasElement;
    animation: Listenable<AnimationFrameData>;

    getBounds: () => DOMRect;
    setMainCamera: (c: Camera) => void;

    scene: () => Scene;
};

const outOfContext = () => {
    throw new Error('out of context!');
};

export const SceneRendererContext = createContext<SceneRendererContext>({
    renderer: outOfContext,
    canvas: outOfContext,
    animation: {
        on: outOfContext,
        off: outOfContext,
    },
    getBounds: outOfContext,
    setMainCamera: outOfContext,
    scene: outOfContext,
});

export const useSceneRenderer = () => useContext(SceneRendererContext);
