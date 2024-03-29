import { type Component } from 'solid-js';
import { PlanetViewScene } from '../../scenes/PlanetViewScene/PlanetViewScene';
import { SceneRenderer } from '../../components/three/SceneRenderer/SceneRenderer';

export const PlanetView: Component = () => {
    return (
        <SceneRenderer>
            <PlanetViewScene seed="deadmouse" />
        </SceneRenderer>
    );
};
