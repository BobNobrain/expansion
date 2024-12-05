import { createEffect, createMemo, Show, type Component } from 'solid-js';
import { PlanetViewSceneLight } from './PlanetViewSceneLight';
import { PlanetViewScenePlanet } from './PlanetViewScenePlanet';
import { RotatableCamera } from '../common/RotatableCamera/RotatableCamera';
import { useSurfaceOverview } from '../../store/galaxy';
import { CelestialSurface } from '../../domain/CelstialSurface';

export type PlanetViewSceneProps = {
    isActive: boolean;
    surfaceId: string;

    selectedPlotId?: string;
    onPlotSelected?: (plotId: string | undefined) => void;
};

export const PlanetViewScene: Component<PlanetViewSceneProps> = (props) => {
    const surface = useSurfaceOverview(() => (props.isActive ? props.surfaceId : undefined));

    const activeTileIndex = createMemo(
        () => (props.selectedPlotId && CelestialSurface.parsePlotId(props.selectedPlotId)) || undefined,
    );

    const onTileClick = (tile: number | undefined) => {
        if (props.onPlotSelected) {
            props.onPlotSelected(tile === undefined ? undefined : CelestialSurface.makePlotId(tile));
        }

        // log stuff
        if (tile === undefined) {
            return;
        }

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
                activeTileIndex={activeTileIndex()}
                onTileClick={onTileClick}
            />
        </Show>
    );
};
