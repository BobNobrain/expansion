import { type Component, For, createMemo, onMount, onCleanup, createSignal } from 'solid-js';
import * as T from 'three';
import { Mesh } from '../../components/three/Mesh/Mesh';
import { useInScene } from '../../components/three/hooks/useInScene';
import { useSceneRenderer } from '../../components/three/context';
import { type CelestialBody } from '../../domain/CelestialBody';
import { type CelestialSurface } from '../../domain/CelstialSurface';
import { usePlanet } from './planet';
import { scale } from './mesh/utils';
import { useEventListener } from '../../lib/solid/useEventListener';
import { type TapGestureData } from '../../lib/gestures/types';
// import { MeshBuilder } from '../../lib/3d/MeshBuilder';

export type PlanetViewScenePlanetProps = {
    body: CelestialBody | null;
    surface: CelestialSurface | null;

    showGraph?: boolean;
};

export const PlanetViewScenePlanet: Component<PlanetViewScenePlanetProps> = (props) => {
    const { gridMesh, surfaceBuilder, surfaceMesh, faceIndexMap } = usePlanet(() => props.surface);
    const [getActiveTileIndex, setActiveTileIndex] = createSignal(-1);

    const activeTileMesh = createMemo(() => {
        const surface = surfaceBuilder();
        if (!surface) {
            return null;
        }

        const index = getActiveTileIndex();
        if (index === -1) {
            return null;
        }

        const verticies = surface
            .face(index)
            .map((vi) => surface.coords(vi))
            .map(scale(1.001));

        verticies.push(verticies[0]);

        const polyGeometry = new T.BufferGeometry();
        polyGeometry.setAttribute('position', new T.Float32BufferAttribute(verticies.flat(), 3));

        const borderLine = new T.Line(
            polyGeometry,
            new T.LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                linewidth: 3,
            }),
        );
        // const activeTileBuilder = new MeshBuilder();
        // for (const v of verticies) {
        //     activeTileBuilder.add(...v);
        // }
        // activeTileBuilder.assembleVerticies(new Array(verticies.length).fill(0).map((_, i) => i));
        // const geom = activeTileBuilder.build().geometry;

        // const material = new T.MeshStandardMaterial({
        //     color: 0xff00ff,
        //     emissive: 0xff00ff,
        //     emissiveIntensity: 0.5,
        //     roughness: 0.6,
        //     metalness: 0.3,
        //     flatShading: true,
        // });

        // return new T.Mesh(geom, material);

        return borderLine;
    });

    const getMeshes = createMemo(() => {
        const grid = props.showGraph ? gridMesh() : null;
        const surface = surfaceMesh();

        const result: T.Mesh[] = [];

        if (grid) {
            result.push(grid);
        }
        if (surface) {
            result.push(surface);
        }

        const activeTile = activeTileMesh();
        if (activeTile) {
            result.push(activeTile as unknown as T.Mesh);
        }

        return result;
    });

    const planetAxis = new T.Line(
        new T.BufferGeometry().setFromPoints([new T.Vector3(0, -1.12, 0), new T.Vector3(0, 1.12, 0)]),
        new T.LineBasicMaterial({ color: 0xffffff }),
    );
    useInScene(() => planetAxis);

    const { canvas, getBounds, getMainCamera, gestures } = useSceneRenderer();

    const raycaster = new T.Raycaster();
    const handleClick = (ev: MouseEvent | TapGestureData) => {
        const cam = getMainCamera();
        if (!cam) {
            return;
        }

        const mesh = surfaceMesh();
        if (!mesh) {
            return;
        }

        const { width, height, x, y } = getBounds();
        const pointer =
            'client' in ev
                ? new T.Vector2(((ev.client.x - x) / width) * 2 - 1, 1 - ((ev.client.y - y) / height) * 2)
                : new T.Vector2((ev.offsetX / width) * 2 - 1, 1 - (ev.offsetY / height) * 2);
        raycaster.setFromCamera(pointer, cam);

        const [closestIntersection] = raycaster.intersectObject(mesh);
        if (!closestIntersection) {
            return;
        }

        const triangleIndex = closestIntersection.faceIndex ?? -1;
        const originalFaceIndex = faceIndexMap()[triangleIndex] ?? -1;

        const vis = [closestIntersection.face!.a, closestIntersection.face!.b, closestIntersection.face!.c];
        const actualCoords = vis.map((vi) => surfaceBuilder()?.coords(vi));
        const expectedCoords = surfaceBuilder()
            ?.face(originalFaceIndex)
            ?.map((vi) => surfaceBuilder()?.coords(vi));

        console.log({
            triangleIndex,
            originalFaceIndex,
            face: surfaceBuilder()?.face(originalFaceIndex),
            f: closestIntersection.face,
            actualCoords,
            expectedCoords,
        });
        if (originalFaceIndex === -1) {
            return;
        }

        setActiveTileIndex(originalFaceIndex);
    };

    onMount(() => {
        const c = canvas();

        c.addEventListener('click', handleClick);
        onCleanup(() => c.removeEventListener('click', handleClick));
    });

    useEventListener(gestures.tap, handleClick);

    return (
        <For each={getMeshes()}>
            {(mesh) => {
                return <Mesh mesh={mesh} />;
            }}
        </For>
    );
};
