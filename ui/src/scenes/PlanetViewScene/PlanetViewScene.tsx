import { type Component } from 'solid-js';
import { PlanetViewSceneLight } from './PlanetViewSceneLight';
import { PlanetViewScenePlanet } from './PlanetViewScenePlanet';
import { RotatableCamera } from '../common/RotatableCamera/RotatableCamera';

export type PlanetViewSceneProps = {
    seed: string;
};

export const PlanetViewScene: Component<PlanetViewSceneProps> = (_) => {
    return (
        <>
            <RotatableCamera
                main
                fov={75}
                far={1000}
                near={0.01}
                minDistance={1.5}
                maxDistance={2.5}
                yawInertia={0.95}
                pitchInertia={0.92}
            />
            <PlanetViewSceneLight />
            <PlanetViewScenePlanet />
        </>
    );
};
