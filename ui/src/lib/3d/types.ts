import type { Scene, Camera, WebGLRenderer } from 'three';
import { type Size2D } from '../math/types';

export type UISceneConstructorData = {
    renderer: WebGLRenderer;
    canvas: HTMLCanvasElement;
};

export type UISceneConstructor = (data: UISceneConstructorData) => UIScene;

export type AnimationFrameData = {
    dt: DOMHighResTimeStamp;
    time: DOMHighResTimeStamp;
    renderer: WebGLRenderer;
    canvas: HTMLCanvasElement;
};

export type ResizeData = {
    newSize: Size2D;
    canvas: HTMLCanvasElement;
    renderer: WebGLRenderer;
};

export type UIScene = {
    scene: Scene;
    mainCamera: Camera;
    onAnimationFrame?: (frame: AnimationFrameData) => void;
    onCanvasResize?: (resize: ResizeData) => void;
    onDestroy?: () => void;
};

export type RawVertex = Readonly<[x: number, y: number, z: number]>;
export type RawEdge = [startIndex: number, endIndex: number];
export type RawFace = [number, number, number];

export enum FaceType {
    EdgeIndicies,
    VertexIndicies,
}

export type Face =
    | { type: FaceType.EdgeIndicies; edges: number[] }
    | { type: FaceType.VertexIndicies; verticies: number[] };

export type Poly = number[];
