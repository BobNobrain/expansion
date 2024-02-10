import { type Component, For, createMemo } from 'solid-js';
import * as T from 'three';
import { usePlanetData } from '../../store/world';
import { Mesh } from '../../components/three/Mesh/Mesh';
import { createPlanetMeshes } from './mesh';
import { useInScene } from '../../components/three/hooks/useInScene';

export const PlanetViewScenePlanet: Component = () => {
    const { getData } = usePlanetData('testPlanet');

    const getMeshes = createMemo(() => {
        const planetData = getData();
        console.log({ planetData });
        if (!planetData) {
            return [];
        }
        return createPlanetMeshes(planetData);
    });

    const planetAxis = new T.Line(
        new T.BufferGeometry().setFromPoints([new T.Vector3(0, -1.12, 0), new T.Vector3(0, 1.12, 0)]),
        new T.LineBasicMaterial({ color: 0xffffff }),
    );
    useInScene(() => planetAxis);

    return (
        <For each={getMeshes()}>
            {(mesh) => {
                return <Mesh mesh={mesh} />;
            }}
        </For>
    );
};
