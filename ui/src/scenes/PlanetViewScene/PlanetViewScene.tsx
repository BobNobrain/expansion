import { createEffect, Show, type Component } from 'solid-js';
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

    const logTileInfo = (tile: number) => {
        const data = surface.data?.surface;
        if (!data) {
            return;
        }

        console.log({
            color: data.colors[tile],
            biome: data.biomes[tile],
            elevation: data.elevations[tile],
            oceanLevel: data.oceanLevel,
        });
    };

    createEffect(() => {
        const data = surface.data?.surface;
        if (!data) {
            return;
        }

        console.log({
            atm: { ...data.atmosphere },
            oceans: { ...data.oceans },
        });
    });

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
                pannable={false}
            />
            <PlanetViewSceneLight />
            <PlanetViewScenePlanet
                surface={surface.data?.surface ?? null}
                body={surface.data?.body ?? null}
                onClick={logTileInfo}
            />
        </Show>
    );
};
