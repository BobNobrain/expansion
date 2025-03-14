import { type Component, createMemo } from 'solid-js';
import { BufferGeometry, Float32BufferAttribute, Line, LineBasicMaterial } from 'three';
import { useInScene } from '../../components/three/hooks/useInScene';
import { type MeshBuilder } from '../../lib/3d/MeshBuilder';
import { scale } from './mesh/utils';

export type PVSActiveTileProps = {
    surface: MeshBuilder | null;
    activeTileIndex: number | undefined;
};

export const PVSActiveTile: Component<PVSActiveTileProps> = (props) => {
    const activeTileMesh = createMemo(() => {
        const surface = props.surface;
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

        const polyGeometry = new BufferGeometry();
        polyGeometry.setAttribute('position', new Float32BufferAttribute(verticies.flat(), 3));

        const borderLine = new Line(
            polyGeometry,
            new LineBasicMaterial({
                color: 0xffffff,
                transparent: true,
                linewidth: 3,
            }),
        );
        borderLine.renderOrder = -1;
        borderLine.name = 'PVS_activeTileBorder';
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

    useInScene(activeTileMesh);
    return null;
};
