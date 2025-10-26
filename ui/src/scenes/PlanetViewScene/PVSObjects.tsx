import { type Component, createMemo, For } from 'solid-js';
import {
    BoxGeometry,
    BufferAttribute,
    BufferGeometry,
    LineBasicMaterial,
    LineLoop,
    Mesh,
    MeshPhongMaterial,
    Quaternion,
    Vector3,
    type Object3D,
} from 'three';
import { type City } from '@/domain/City';
import { World } from '@/domain/World';
import type { MeshBuilder } from '@/lib/3d/MeshBuilder';
import { getTilesOutline } from '@/lib/3d/utils';
import { dfCitiesByWorldId } from '@/store/datafront';
import { SceneObject } from '@/three/SceneObject/SceneObject';

export type PVSObjectsProps = {
    world: World | null;
    surface: MeshBuilder | null;
};

const cityBoxMat = new MeshPhongMaterial({
    color: 0xbbbbbb,
    reflectivity: 0.5,
    emissive: 0xffdd88,
    emissiveIntensity: 0.05,
});

const cityOutlineMat = new LineBasicMaterial({
    color: 0xd4d4f9,
    linewidth: 2,
});

export const PVSObjects: Component<PVSObjectsProps> = (props) => {
    const worldCities = dfCitiesByWorldId.use(() => (props.world ? { worldId: props.world.id } : null));

    const objects = createMemo(() => {
        const result: Object3D[] = [];
        const world = props.world;
        const builder = props.surface;

        if (!world || !builder) {
            return null;
        }

        const cities = Object.values(worldCities.result());

        for (const city of cities) {
            const tileIndex = World.parseTileId(city.centerTileId);
            if (!tileIndex) {
                continue;
            }

            result.push(createCityBox(world, city, tileIndex));
            result.push(createCityOutline(city, builder));
        }

        return result;
    });

    return <For each={objects()}>{(obj) => <SceneObject object={obj} />}</For>;
};

function createCityBox(world: World, city: City, tileIndex: number): Object3D {
    const pos = World.getTileCoords(world.grid, tileIndex);
    const box = new BoxGeometry(0.07, 0.05, 0.07);
    const mesh = new Mesh(box, cityBoxMat);

    mesh.name = `PVSCityBox_${city.id}`;
    mesh.position.set(...pos);
    mesh.setRotationFromQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), mesh.position));
    return mesh;
}

function createCityOutline(city: City, builder: MeshBuilder): Object3D {
    const tileIndicies = [...city.claimedTileIds, city.centerTileId].map((id) => World.parseTileId(id)!);
    const outlineCoords = getTilesOutline(builder, new Set(tileIndicies));

    const geom = new BufferGeometry();
    geom.setAttribute('position', new BufferAttribute(new Float32Array(outlineCoords.flat().map((x) => x * 1.001)), 3));

    const outline = new LineLoop(geom, cityOutlineMat);
    outline.name = `PVSCityOutline_${city.id}`;
    return outline;
}
