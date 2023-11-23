import { type Component } from 'solid-js';
import { PlanetViewScene } from '../../scenes/PlanetViewScene/PlanetViewScene';
import { SceneRenderer } from '../../components/SceneRenderer/SceneRenderer';

export const PlanetView: Component = () => {
    const planetViewScene = PlanetViewScene({ seed: 'deadmouse' });

    return <SceneRenderer scene={planetViewScene} />;
};
