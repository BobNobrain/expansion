import { createEffect, createMemo, createSignal, Show, type Component } from 'solid-js';
import { SceneControls, SceneControlsButton } from '../../components/SceneControls';
import { CelestialSurface } from '../../domain/CelstialSurface';
import { IconPeople, IconPlanet, IconPlot, IconRadius, IconRocks } from '../../icons';
import { useSurfaceOverview } from '../../store/galaxy';
import { RotatableCamera } from '../common/RotatableCamera/RotatableCamera';
import { type TileRenderMode } from './colors';
import { PlanetViewSceneLight } from './PlanetViewSceneLight';
import { PlanetViewScenePlanet } from './PlanetViewScenePlanet';

export type PlanetViewSceneProps = {
    isActive: boolean;
    surfaceId: string;

    selectedPlotId?: string;
    onPlotSelected?: (plotId: string | undefined) => void;
};

export const PlanetViewScene: Component<PlanetViewSceneProps> = (props) => {
    const surface = useSurfaceOverview(() => (props.isActive ? props.surfaceId : undefined));
    const [getTileRenderMode, setTileRenderMode] = createSignal<TileRenderMode>('natural');

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

    const setTRMNatural = () => setTileRenderMode('natural');
    const setTRMBiomes = () => setTileRenderMode('biomes');
    const setTRMPopulation = () => setTileRenderMode('population');
    const setTRMResources = () => setTileRenderMode('resources');
    const setTRMElevations = () => setTileRenderMode('elevations');

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
            <PlanetViewSceneLight isNatural={getTileRenderMode() === 'natural'} />
            <PlanetViewScenePlanet
                surface={surface.data?.surface ?? null}
                body={surface.data?.body ?? null}
                activeTileIndex={activeTileIndex()}
                onTileClick={onTileClick}
                tileRenderMode={getTileRenderMode()}
            />
            <SceneControls>
                <SceneControlsButton
                    icon={IconPlanet}
                    isActive={getTileRenderMode() === 'natural'}
                    onClick={setTRMNatural}
                />
                <SceneControlsButton
                    icon={IconPlot}
                    isActive={getTileRenderMode() === 'biomes'}
                    onClick={setTRMBiomes}
                />
                <SceneControlsButton
                    icon={IconPeople}
                    isActive={getTileRenderMode() === 'population'}
                    onClick={setTRMPopulation}
                />
                <SceneControlsButton
                    icon={IconRocks}
                    isActive={getTileRenderMode() === 'resources'}
                    onClick={setTRMResources}
                />
                <SceneControlsButton
                    icon={IconRadius}
                    isActive={getTileRenderMode() === 'elevations'}
                    onClick={setTRMElevations}
                />
            </SceneControls>
        </Show>
    );
};
