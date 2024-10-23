import { Show, type Component } from 'solid-js';
import { PlanetViewSceneLight } from './PlanetViewSceneLight';
import { PlanetViewScenePlanet } from './PlanetViewScenePlanet';
import { RotatableCamera } from '../common/RotatableCamera/RotatableCamera';
import { useSurfaceOverview } from '../../store/galaxy';

export type PlanetViewSceneProps = {
    isActive: boolean;
    surfaceId: string;
};

export const PlanetViewScene: Component<PlanetViewSceneProps> = (props) => {
    const surface = useSurfaceOverview(() => (props.isActive ? props.surfaceId : undefined));

    return (
        <Show when={props.isActive && surface.data}>
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
            <PlanetViewScenePlanet surface={surface.data?.surface ?? null} body={surface.data?.body ?? null} />
        </Show>
    );
};
