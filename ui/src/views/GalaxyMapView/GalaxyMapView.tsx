import { type Component } from 'solid-js';
import { GalaxyMapScene } from '../../scenes/GalaxyMapScene/GalaxyMapScene';
import { SceneRenderer } from '../../components/three/SceneRenderer/SceneRenderer';

export const GalaxyMapView: Component = () => {
    return (
        <SceneRenderer>
            <GalaxyMapScene />
        </SceneRenderer>
    );
};
