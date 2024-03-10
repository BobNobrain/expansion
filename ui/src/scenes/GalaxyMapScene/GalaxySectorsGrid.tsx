import { createEffect, type Component } from 'solid-js';
import * as T from 'three';
import { useSceneRenderer } from '../../components/three/context';
import { useInScene } from '../../components/three/hooks/useInScene';
import { Point2D } from '../../lib/math/2d';
import { useEventListener } from '../../lib/solid/useEventListener';
import { findSectorFor, type Sector } from './sectors';
import { useLazyAnimation } from '../../components/three/hooks/useAnimation';
import { lerp } from '../../lib/math/misc';

export type GalaxySectorsGridProps = {
    sectors: Sector[];
    isActive: boolean;
    onClick: (sector: Sector | null) => void;
};

export const GalaxySectorsGrid: Component<GalaxySectorsGridProps> = (props) => {
    const sectorsLineMaterial = new T.LineBasicMaterial({
        color: 0x59598a,
        transparent: true,
        opacity: 1,
    });

    const gridLines: T.Line[] = [];

    for (const sector of props.sectors) {
        const sectorGeom = new T.BufferGeometry();
        const verticies = sector.points.map(({ x, y }) => [x, 0, y]);
        sectorGeom.setAttribute('position', new T.BufferAttribute(new Float32Array(verticies.flat()), 3));
        const bounds = new T.Line(sectorGeom, sectorsLineMaterial);
        gridLines.push(bounds);
        useInScene(() => bounds);
    }

    const xzPlane = new T.Plane(new T.Vector3(0, 1, 0), 0);

    const raycaster = new T.Raycaster();

    const { gestures, getMainCamera, getBounds } = useSceneRenderer();

    const triggerFadeAnimation = useLazyAnimation(() => {
        const targetOpacity = props.isActive ? 1 : 0.05;
        const currentOpacity = sectorsLineMaterial.opacity;

        if (Math.abs(targetOpacity - currentOpacity) < 0.1) {
            sectorsLineMaterial.opacity = targetOpacity;
            return;
        }

        sectorsLineMaterial.opacity = lerp(currentOpacity, targetOpacity, 0.1);
        triggerFadeAnimation();
    });

    createEffect(() => {
        props.isActive;
        triggerFadeAnimation();
    });

    useEventListener(gestures.tap, (tap) => {
        if (!props.isActive) {
            return;
        }

        const cam = getMainCamera();
        if (!cam) {
            return;
        }

        const { x, y, width, height } = getBounds();
        const pointer = new T.Vector2(((tap.client.x - x) / width) * 2 - 1, 1 - ((tap.client.y - y) / height) * 2);
        raycaster.setFromCamera(pointer, cam);
        const intersectionCoords = new T.Vector3();
        raycaster.ray.intersectPlane(xzPlane, intersectionCoords);

        const intersectionPoint: Point2D = { x: intersectionCoords.x, y: intersectionCoords.z };
        const r = intersectionCoords.length();
        const theta = Point2D.angle({ x: 1, y: 0 }, intersectionPoint);

        const sector = findSectorFor(props.sectors, r, theta);
        props.onClick(sector);
    });

    return null;
};
