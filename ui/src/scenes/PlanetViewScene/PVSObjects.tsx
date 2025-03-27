import { type Component, createMemo, For } from 'solid-js';
import { BoxGeometry, Mesh, MeshPhongMaterial, Quaternion, Vector3, type Object3D } from 'three';
import { SceneObject } from '../../components/three/SceneObject/SceneObject';
import { World } from '../../domain/World';
import { dfCitiesByWorldId } from '../../store/datafront';

export type PVSObjectsProps = {
    world: World | null;
};

const cityBoxMat = new MeshPhongMaterial({
    color: 0xbbbbbb,
    reflectivity: 0.5,
    emissive: 0xffdd88,
    emissiveIntensity: 0.05,
});

export const PVSObjects: Component<PVSObjectsProps> = (props) => {
    const worldCities = dfCitiesByWorldId.use(() => (props.world ? { worldId: props.world.id } : null));

    const objects = createMemo(() => {
        const result: Object3D[] = [];
        const world = props.world;

        if (!world) {
            return null;
        }

        const cities = Object.values(worldCities.result());

        for (const city of cities) {
            const tileIndex = World.parseTileId(city.centerTileId);
            if (!tileIndex) {
                continue;
            }

            const pos = World.getTileCoords(world.grid, tileIndex);
            const box = new BoxGeometry(0.07, 0.05, 0.07);
            const mesh = new Mesh(box, cityBoxMat);

            mesh.name = `PVSCityBox_${city.id}`;
            mesh.position.set(...pos);
            mesh.setRotationFromQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), mesh.position));
            result.push(mesh);
        }

        return result;
    });

    return <For each={objects()}>{(obj) => <SceneObject object={obj} />}</For>;
};
