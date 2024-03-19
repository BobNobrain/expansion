import { createEffect, type Component, createMemo, For } from 'solid-js';
import * as T from 'three';
import { useSceneRenderer } from '../../components/three/context';
import { type GalacticGrid, type GalacticGridSector } from '../../domain/GalacticOverview';
import { Point2D } from '../../lib/math/2d';
import { useEventListener } from '../../lib/solid/useEventListener';
import { GridBuilder } from './GridBuilder';
import { SceneObject } from '../../components/three/SceneObject/SceneObject';
import { useAnimatedNumber } from '../../components/three/hooks/useAnimatedValue';
import { useCanvasListener } from '../../components/three/hooks/useCanvasListener';
import { GalaxyStars } from './GalaxyStars';
import { useSectorContent } from '../../store/galaxy';
import { GraphicsQuality, useDeviceSettings } from '../../store/settings';

export type GalaxySectorsGridProps = {
    grid: GalacticGrid;
    activeSectorId: string | null;
    onClick: (sector: GalacticGridSector | null) => void;
};

export const GalaxySectorsGrid: Component<GalaxySectorsGridProps> = (props) => {
    const sectorsLineMaterial = new T.LineBasicMaterial({
        color: 0x59598a,
        transparent: true,
        opacity: 1,
    });

    const activeSectorMaterial = new T.LineBasicMaterial({
        color: 0xf7b212,
        transparent: true,
        opacity: 1,
    });

    const deviceSettings = useDeviceSettings();

    const makeGridBuilder = createMemo(() => {
        if (!props.grid) {
            return null;
        }

        let segmentLength: number;
        switch (deviceSettings.settings.graphicsQuality) {
            case GraphicsQuality.Low:
                segmentLength = 0.4;
                break;

            case GraphicsQuality.Medium:
                segmentLength = 0.3;
                break;

            case GraphicsQuality.High:
                segmentLength = 0.2;
                break;
        }

        return new GridBuilder(props.grid, segmentLength);
    });

    const gridMeshes = createMemo(() => {
        // TODO: do not render each sector in the grid individually
        const gridLines: T.Line[] = [];

        const gridBuilder = makeGridBuilder();
        if (!gridBuilder) {
            return gridLines;
        }

        let activeLines: T.Line | null = null;

        for (const sector of props.grid.sectors) {
            const sectorGeom = new T.BufferGeometry();
            const verticies = gridBuilder.getVerticiesOf(sector);
            sectorGeom.setAttribute('position', new T.BufferAttribute(new Float32Array(verticies.flat()), 3));

            const isActive = sector.id === props.activeSectorId;
            const bounds = new T.Line(sectorGeom, isActive ? activeSectorMaterial : sectorsLineMaterial);

            if (isActive) {
                activeLines = bounds;
            } else {
                gridLines.push(bounds);
            }
        }

        if (activeLines) {
            activeLines.renderOrder = -2;
            gridLines.push(activeLines);
        }

        return gridLines;
    });

    const xzPlane = new T.Plane(new T.Vector3(0, 1, 0), 0);

    const raycaster = new T.Raycaster();

    const { gestures, getMainCamera, getBounds } = useSceneRenderer();

    const gridOpacity = useAnimatedNumber({
        target: () => (props.activeSectorId ? 0.05 : 1),
        durationMs: 200,
        eps: 1e-2,
    });

    createEffect(() => {
        const op = gridOpacity();
        sectorsLineMaterial.opacity = op;
    });

    const onClick = (clientX: number, clientY: number) => {
        const cam = getMainCamera();
        if (!cam) {
            return;
        }

        const { x, y, width, height } = getBounds();
        const pointer = new T.Vector2(((clientX - x) / width) * 2 - 1, 1 - ((clientY - y) / height) * 2);
        raycaster.setFromCamera(pointer, cam);
        const intersectionCoords = new T.Vector3();
        raycaster.ray.intersectPlane(xzPlane, intersectionCoords);

        const intersectionPoint: Point2D = { x: intersectionCoords.x, y: intersectionCoords.z };
        const r = intersectionCoords.length();
        const theta = Point2D.angle({ x: 1, y: 0 }, intersectionPoint);

        const sector = props.grid.findContainingSector({ r, theta, h: 0 });
        props.onClick(sector);
    };

    useEventListener(gestures.tap, (tap) => onClick(tap.client.x, tap.client.y));
    useCanvasListener('click', (ev) => onClick(ev.clientX, ev.clientY));

    const sectorContent = useSectorContent(() => props.activeSectorId);

    return (
        <>
            <For each={gridMeshes()}>{(line) => <SceneObject object={line} />}</For>
            <GalaxyStars stars={sectorContent.data ?? []} withNormals dim={!sectorContent.data} />
        </>
    );
};
