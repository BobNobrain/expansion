import { type Component, createMemo } from 'solid-js';
import { EdgesGeometry, LineBasicMaterial, LineSegments, type Mesh } from 'three';
import { useInScene } from '../../components/three/hooks/useInScene';

export type PVSTileBordersProps = {
    visible: boolean;
    surfaceMesh: Mesh | null;
};

export const PVSTileBorders: Component<PVSTileBordersProps> = (props) => {
    const gridEdgesMesh = createMemo(() => {
        const surface = props.surfaceMesh;
        if (!surface) {
            return null;
        }

        const edges = new EdgesGeometry(surface.geometry);
        edges.scale(1.001, 1.001, 1.001);
        const result = new LineSegments(edges, new LineBasicMaterial({ color: 0xf7b212, opacity: 0.5, linewidth: 2 }));
        result.name = 'PVS_tileBorders';
        return result;
    });

    useInScene(() => (props.visible ? gridEdgesMesh() : null));
    return null;
};
