import { createMemo, type Component } from 'solid-js';
import * as T from 'three';
import { useInScene } from '../../components/three/hooks/useInScene';
import { isInSector, type Sector } from './sectors';
import { useSceneRenderer } from '../../components/three/context';
import { useEventListener } from '../../lib/solid/useEventListener';
import { useRaycaster } from '../../components/three/hooks/useRaycaster';
import { Point2D } from '../../lib/math/2d';

export type GalaxyMapActiveSectorProps = {
    sector: Sector | null;
    onClickOff: () => void;
};

export const GalaxyMapActiveSector: Component<GalaxyMapActiveSectorProps> = (props) => {
    const activeSectorMaterial = new T.LineBasicMaterial({
        color: 0xf7b212,
        opacity: 1,
    });

    const activeSectorGeometries = createMemo(() => {
        const activeSector = props.sector;
        if (!activeSector) {
            return null;
        }

        const geom = new T.BufferGeometry();
        geom.setAttribute(
            'position',
            new T.BufferAttribute(new Float32Array(activeSector.points.map(({ x, y }) => [x, 0, y]).flat()), 3),
        );

        const line = new T.Line(geom, activeSectorMaterial);
        return line;
    });

    useInScene(activeSectorGeometries);

    const { gestures } = useSceneRenderer();
    const { setFromClient } = useRaycaster();
    const xzPlane = new T.Plane(new T.Vector3(0, 1, 0), 0);

    useEventListener(gestures.tap, (tap) => {
        if (!props.sector) {
            return;
        }

        const raycaster = setFromClient(tap.client);

        const intersectionCoords = new T.Vector3();
        raycaster.ray.intersectPlane(xzPlane, intersectionCoords);

        const intersectionPoint: Point2D = { x: intersectionCoords.x, y: intersectionCoords.z };
        const r = intersectionCoords.length();
        const theta = Point2D.angle({ x: 1, y: 0 }, intersectionPoint);

        if (!isInSector(props.sector, r, theta)) {
            props.onClickOff();
        }
    });

    return null;
};
