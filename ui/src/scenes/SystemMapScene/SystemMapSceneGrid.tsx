import { type Component, createMemo, For } from 'solid-js';
import * as T from 'three';
import { type RawVertex } from '../../lib/3d/types';
import { Angle } from '../../lib/math/angle';
import { SceneObject } from '../../components/three/SceneObject/SceneObject';

export type SystemMapSceneGridProps = {
    outsideBorder: number;
};

const GRID_CIRCLE_RADII = [
    1, 2, 3, 4, 5, 10, 15, 20, 25, 50, 75, 100, 125, 150, 175, 200, 250, 300, 350, 400, 450, 500,
];

export const SystemMapSceneGrid: Component<SystemMapSceneGridProps> = (props) => {
    const mat = new T.LineBasicMaterial({ color: 0x59598a });

    const axis = createMemo(() => {
        const geom = new T.BufferGeometry();
        geom.setAttribute('position', new T.BufferAttribute(new Float32Array([0, 0, 0, props.outsideBorder, 0, 0]), 3));
        return new T.Line(geom, mat);
    });

    const circles = createMemo(() => {
        const gridLines: T.Object3D[] = [];

        for (const r of GRID_CIRCLE_RADII) {
            if (r > props.outsideBorder) {
                break;
            }

            const circlePoints = getCircleVerticies(r);
            const ringGeom = new T.BufferGeometry();
            ringGeom.setAttribute('position', new T.BufferAttribute(new Float32Array(circlePoints.flat()), 3));
            gridLines.push(new T.LineLoop(ringGeom, mat));
        }

        return gridLines;
    });

    return (
        <>
            <SceneObject object={axis()} />
            <For each={circles()}>{(obj) => <SceneObject object={obj} />}</For>
        </>
    );
};

function getCircleVerticies(r: number): RawVertex[] {
    const dth = 0.1 / r;
    const result: RawVertex[] = [];
    for (const th of Angle.iterateFullCircle(dth)) {
        result.push([r * Math.cos(th), 0, r * Math.sin(th)]);
    }
    return result;
}
