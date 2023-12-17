import * as T from 'three';
import { type UISceneConstructor, type AnimationFrameData } from '../../lib/3d/types';
import { createPlanetMeshes } from './planet';

export type PlanetViewSceneProps = {
    seed: string;
};

const SUN_Y = 0.3;
const SUN_ROTATION_PERIOD = 30000;
const SUN_ROTATION_FACTOR = (Math.PI * 2) / SUN_ROTATION_PERIOD;

export const PlanetViewScene = (_: PlanetViewSceneProps): UISceneConstructor => {
    return function createPlanetViewScene({ canvas }) {
        const scene = new T.Scene();
        const mainCamera = new T.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
        mainCamera.position.z = 2.5;

        const meshes = createPlanetMeshes();
        for (const mesh of meshes) {
            scene.add(mesh);
        }

        const sun = new T.DirectionalLight(0xffffff, 1);
        sun.position.set(1, SUN_Y, 0);
        scene.add(sun);

        const rotateSun = ({ time }: AnimationFrameData) => {
            sun.position.set(Math.cos(time * SUN_ROTATION_FACTOR), SUN_Y, Math.sin(time * SUN_ROTATION_FACTOR));

            for (const mesh of meshes) {
                mesh.rotation.set(time * SUN_ROTATION_FACTOR, time * 2 * SUN_ROTATION_FACTOR, 0);
            }
        };

        return {
            scene,
            mainCamera,
            onAnimationFrame: (frame) => {
                rotateSun(frame);
            },
            onCanvasResize: (resize) => {
                mainCamera.aspect = resize.newSize.width / resize.newSize.height;
                mainCamera.updateProjectionMatrix();
            },
        };
    };
};
