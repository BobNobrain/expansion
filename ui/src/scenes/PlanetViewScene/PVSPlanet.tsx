import { type Component, createMemo } from 'solid-js';
import * as T from 'three';
import { SceneObject } from '../../components/three/SceneObject/SceneObject';
import { type World } from '../../domain/World';
import { usePlanet } from './planet';
import { type RenderMode } from './settings';
import { PVSActiveTile } from './PVSActiveTile';
import { PVSTileBorders } from './PVSTileBorders';
import { useTileSelector } from './tileSelector';

export type PVSPlanetProps = {
    world: World | null;

    showBorders?: boolean;
    tileRenderMode: RenderMode;

    activeTileIndex?: number | undefined;
    onTileClick?: (tile: number | undefined) => void;
};

export const PVSPlanet: Component<PVSPlanetProps> = (props) => {
    const { surfaceBuilder, surfaceMesh, faceIndexMap } = usePlanet(
        () => props.world,
        () => props.tileRenderMode,
    );

    const getPlanetSurface = createMemo(() => {
        const surface = surfaceMesh();

        return surface ?? new T.Mesh(new T.SphereGeometry(1), new T.MeshBasicMaterial({ color: 0x101010 }));
    });

    const planetAxis = new T.Line(
        new T.BufferGeometry().setFromPoints([new T.Vector3(0, -1.12, 0), new T.Vector3(0, 1.12, 0)]),
        new T.LineBasicMaterial({ color: 0xffffff }),
    );

    useTileSelector({
        onTileClick: props.onTileClick,
        faceIndexMap,
        surfaceMesh,
    });

    return (
        <>
            <SceneObject name="PVS_planetSurface" object={getPlanetSurface()} />
            <PVSTileBorders surfaceMesh={surfaceMesh()} visible={props.showBorders ?? false} />
            <PVSActiveTile surface={surfaceBuilder()} activeTileIndex={props.activeTileIndex} />
            <SceneObject name="PVS_planetAxis" object={planetAxis} />
        </>
    );
};
