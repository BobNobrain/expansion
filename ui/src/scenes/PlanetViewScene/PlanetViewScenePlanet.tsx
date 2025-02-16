import { type Component, For, createMemo, onMount, onCleanup } from 'solid-js';
import * as T from 'three';
import { Mesh } from '../../components/three/Mesh/Mesh';
import { SceneObject } from '../../components/three/SceneObject/SceneObject';
import { useSceneRenderer } from '../../components/three/context';
import { type World } from '../../domain/World';
import { type TapGestureData } from '../../lib/gestures/types';
import { useEventListener } from '../../lib/solid/useEventListener';
import { type TileRenderMode } from './colors';
import { scale } from './mesh/utils';
import { usePlanet } from './planet';

export type PlanetViewScenePlanetProps = {
    world: World | null;

    showGraph?: boolean;
    tileRenderMode: TileRenderMode;

    activeTileIndex?: number | undefined;
    onTileClick?: (tile: number | undefined) => void;
};

export const PlanetViewScenePlanet: Component<PlanetViewScenePlanetProps> = (props) => {
    const { gridMesh, surfaceBuilder, surfaceMesh, faceIndexMap } = usePlanet(
        () => props.world,
        () => props.tileRenderMode,
    );

    const activeTileMesh = createMemo(() => {
        const surface = surfaceBuilder();
        if (!surface) {
            return null;
        }

        const index = props.activeTileIndex ?? -1;
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
        borderLine.renderOrder = -1;
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
        } else {
            // unexplored planet gray mesh
            result.push(new T.Mesh(new T.SphereGeometry(1), new T.MeshBasicMaterial({ color: 0x101010 })));
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
            props.onTileClick?.(undefined);
            return;
        }

        const triangleIndex = closestIntersection.faceIndex ?? -1;
        const originalFaceIndex = faceIndexMap()[triangleIndex] ?? -1;

        if (originalFaceIndex === -1) {
            props.onTileClick?.(undefined);
            return;
        }

        props.onTileClick?.(originalFaceIndex);
    };

    onMount(() => {
        const c = canvas();

        c.addEventListener('click', handleClick);
        onCleanup(() => c.removeEventListener('click', handleClick));
    });

    useEventListener(gestures.tap, handleClick);

    return (
        <>
            <For each={getMeshes()}>
                {(mesh) => {
                    return <Mesh mesh={mesh} />;
                }}
            </For>
            <SceneObject object={planetAxis} />
        </>
    );
};
