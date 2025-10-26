import { type WebGLRenderer } from 'three';

export type AnimationFrameData = {
    dt: DOMHighResTimeStamp;
    time: DOMHighResTimeStamp;
    renderer: WebGLRenderer;
    canvas: HTMLCanvasElement;
};

export type AnimationHandler = (data: AnimationFrameData) => void;
