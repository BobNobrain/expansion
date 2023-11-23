import * as T from 'three';
import { type UISceneConstructor, type AnimationFrameData } from '../../lib/3d/types';

export type PlanetViewSceneProps = {
    seed: string;
};

const SUN_Y = 1;
const SUN_ROTATION_PERIOD = 30000;
const SUN_ROTATION_FACTOR = (Math.PI * 2) / SUN_ROTATION_PERIOD;

export const PlanetViewScene = (_: PlanetViewSceneProps): UISceneConstructor => {
    return function createPlanetViewScene({ canvas }) {
        const scene = new T.Scene();
        const mainCamera = new T.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
        mainCamera.position.z = 5;

        const geom = new T.SphereGeometry(1);
        const mat = new T.MeshPhongMaterial({ color: 0x0080ff, shininess: 0.5, flatShading: true });
        const sphere = new T.Mesh(geom, mat);
        sphere.castShadow = true;
        scene.add(sphere);

        const sun = new T.DirectionalLight(0xffffff, 1);
        sun.position.set(1, SUN_Y, 0);
        scene.add(sun);

        const rotateSun = ({ time }: AnimationFrameData) => {
            sun.position.set(Math.cos(time * SUN_ROTATION_FACTOR), SUN_Y, Math.sin(time * SUN_ROTATION_FACTOR));
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
