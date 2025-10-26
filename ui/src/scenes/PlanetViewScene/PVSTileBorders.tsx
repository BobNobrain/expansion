import { type Component, createMemo } from 'solid-js';
import { BufferAttribute, BufferGeometry, LineBasicMaterial, LineSegments } from 'three';
import { type MeshBuilder } from '@/lib/3d/MeshBuilder';
import { useInScene } from '@/three/hooks/useInScene';

export type PVSTileBordersProps = {
    visible: boolean;
    builderBeforeTriangulation: MeshBuilder | null;
};

const bordersMat = new LineBasicMaterial({ color: 0xf7b212, opacity: 0.3, linewidth: 2, transparent: true });
const SCALE_UP = 1.001;

export const PVSTileBorders: Component<PVSTileBordersProps> = (props) => {
    const gridEdgesMesh = createMemo(() => {
        const builder = props.builderBeforeTriangulation;
        if (!builder) {
            return null;
        }

        const coords: number[] = [];

        for (const face of builder.getAllFaces()) {
            for (let i = 0; i < face.length; i++) {
                const a = builder.getOriginalVertexIndex(face[i]);
                const b = builder.getOriginalVertexIndex(face[(i + 1) % face.length]);

                if (a < b) {
                    continue;
                }

                const [ax, ay, az] = builder.coords(a);
                coords.push(ax * SCALE_UP, ay * SCALE_UP, az * SCALE_UP);

                const [bx, by, bz] = builder.coords(b);
                coords.push(bx * SCALE_UP, by * SCALE_UP, bz * SCALE_UP);
            }
        }

        const geom = new BufferGeometry();
        geom.setAttribute('position', new BufferAttribute(new Float32Array(coords), 3));

        const result = new LineSegments(geom, bordersMat);
        result.name = 'PVS_tileBorders';
        result.renderOrder = -1;

        return result;
    });

    useInScene(() => (props.visible ? gridEdgesMesh() : null));
    return null;
};
