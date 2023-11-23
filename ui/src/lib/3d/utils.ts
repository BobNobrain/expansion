import { Scene, PerspectiveCamera } from 'three';
import { type UIScene } from './types';

export function setupSimpleScene(): Pick<UIScene, 'mainCamera' | 'scene'> {
    const scene = new Scene();
    const mainCamera = new PerspectiveCamera(75, 4 / 3, 0.1, 1000);

    return { scene, mainCamera };
}
