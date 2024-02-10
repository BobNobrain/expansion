import { type Component } from 'solid-js';
// import * as T from 'three';
import { SceneRenderer } from '../../components/three/SceneRenderer/SceneRenderer';
// import { type UISceneConstructor, type AnimationFrameData } from '../../lib/3d/types';
// import { createPlanetMeshes } from './planet';
// import { useDrag } from '../../lib/solid/drag';
// import { usePlanetData } from '../../store/world';
// import { createPlanetMeshes } from './mesh';
import { PlanetViewSceneCamera } from './PlanetViewSceneCamera';
import { PlanetViewSceneLight } from './PlanetViewSceneLight';
// import { Mesh } from '../../components/three/Mesh/Mesh';
import { PlanetViewScenePlanet } from './PlanetViewScenePlanet';

export type PlanetViewSceneProps = {
    seed: string;
};

// const SUN_Y = 0.3;
// const SUN_ROTATION_PERIOD = 30000;
// const SUN_ROTATION_FACTOR = (Math.PI * 2) / SUN_ROTATION_PERIOD;
// const CAMERA_DISTANCE = 2.5;
// const PITCH_MIN = 0.087; // ~5deg
// const PITCH_MAX = Math.PI - PITCH_MIN;

export const PlanetViewScene: Component<PlanetViewSceneProps> = (_) => {
    return (
        <SceneRenderer>
            <PlanetViewSceneCamera />
            <PlanetViewSceneLight />
            <PlanetViewScenePlanet />
        </SceneRenderer>
    );
};

// export const PlanetViewScene = (_: PlanetViewSceneProps): UISceneConstructor => {
//     return function createPlanetViewScene({ canvas }) {
//         const { getData } = usePlanetData('testPlanet');

//         const scene = new T.Scene();
//         const mainCamera = new T.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 1000);
//         let yaw = 0;
//         let pitch = Math.PI / 2;
//         let cameraPlacementNeedsUpdate = false;

//         const updateCameraPlacement = () => {
//             mainCamera.position.setFromSphericalCoords(CAMERA_DISTANCE, pitch, yaw);
//             mainCamera.lookAt(0, 0, 0);
//             cameraPlacementNeedsUpdate = false;
//         };
//         updateCameraPlacement();

//         // const meshes = createPlanetMeshes();
//         let meshes: T.Mesh[] = [];
//         createEffect(() => {
//             const planetData = getData();
//             console.log({ planetData });

//             for (const mesh of meshes) {
//                 scene.remove(mesh);
//             }

//             if (!planetData) {
//                 meshes = [];
//                 return;
//             }

//             meshes = createPlanetMeshes(planetData);
//             for (const mesh of meshes) {
//                 scene.add(mesh);
//             }
//         });

//         const sun = new T.DirectionalLight(0xffffff, 1);
//         sun.position.set(1, SUN_Y, 0);
//         scene.add(sun);

//         const ambience = new T.AmbientLight(0xffffff, 0.1);
//         scene.add(ambience);

//         const planetAxis = new T.Line(
//             new T.BufferGeometry().setFromPoints([new T.Vector3(0, -1.12, 0), new T.Vector3(0, 1.12, 0)]),
//             new T.LineBasicMaterial({ color: 0xffffff }),
//         );
//         scene.add(planetAxis);

//         const rotateSun = ({ time }: AnimationFrameData) => {
//             sun.position.set(Math.cos(time * SUN_ROTATION_FACTOR), SUN_Y, Math.sin(time * SUN_ROTATION_FACTOR));

//             // for (const mesh of meshes) {
//             //     mesh.rotation.set(time * SUN_ROTATION_FACTOR, time * 2 * SUN_ROTATION_FACTOR, 0);
//             // }
//         };

//         const { handlers } = useDrag({
//             onDrag: (ev) => {
//                 const dpitch = -ev.lastChange.y * (Math.PI / 1000);
//                 const dyaw = -ev.lastChange.x * (Math.PI / 1000);

//                 yaw += dyaw;
//                 pitch = Math.max(PITCH_MIN, Math.min(pitch + dpitch, PITCH_MAX));

//                 cameraPlacementNeedsUpdate = true;
//             },
//         });
//         canvas.addEventListener('mousedown', handlers.onMouseDown);
//         canvas.addEventListener('mouseup', handlers.onMouseUp);

//         return {
//             scene,
//             mainCamera,
//             onAnimationFrame: (frame) => {
//                 rotateSun(frame);

//                 if (cameraPlacementNeedsUpdate) {
//                     updateCameraPlacement();
//                 }
//             },
//             onCanvasResize: (resize) => {
//                 mainCamera.aspect = resize.newSize.width / resize.newSize.height;
//                 mainCamera.updateProjectionMatrix();
//             },
//         };
//     };
// };
