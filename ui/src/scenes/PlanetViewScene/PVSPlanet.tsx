import { type Component, createMemo } from 'solid-js';
import * as T from 'three';
import { SceneObject } from '../../components/three/SceneObject/SceneObject';
import { type MeshBuilder } from '../../lib/3d/MeshBuilder';
import { useTileSelector } from './tileSelector';
import { PVSActiveTile } from './PVSActiveTile';
import { PVSTileBorders } from './PVSTileBorders';

export type PVSPlanetProps = {
    surfaceBuilder: MeshBuilder | null;
    surfaceMesh: T.Mesh | null;
    faceIndexMap: Record<number, number>;

    showBorders: boolean;

    activeTileIndex: number | undefined;
    onTileClick?: (tile: number | undefined) => void;
};

export const PVSPlanet: Component<PVSPlanetProps> = (props) => {
    const getPlanetSurface = createMemo(() => {
        const surface = props.surfaceMesh;

        return surface ?? new T.Mesh(new T.SphereGeometry(1), new T.MeshBasicMaterial({ color: 0x101010 }));
    });

    const planetAxis = new T.Line(
        new T.BufferGeometry().setFromPoints([new T.Vector3(0, -1.12, 0), new T.Vector3(0, 1.12, 0)]),
        new T.LineBasicMaterial({ color: 0xffffff }),
    );

    useTileSelector({
        onTileClick: props.onTileClick,
        faceIndexMap: () => props.faceIndexMap,
        surfaceMesh: () => props.surfaceMesh,
    });

    return (
        <>
            <SceneObject name="PVS_planetSurface" object={getPlanetSurface()} />
            <PVSTileBorders builderBeforeTriangulation={props.surfaceBuilder} visible={props.showBorders ?? false} />
            <PVSActiveTile surface={props.surfaceBuilder} activeTileIndex={props.activeTileIndex} />
            <SceneObject name="PVS_planetAxis" object={planetAxis} />
        </>
    );
};
