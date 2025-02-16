import { createMemo, createSignal, Show, type Component } from 'solid-js';
import { SceneControls, SceneControlsButton } from '../../components/SceneControls';
import { World } from '../../domain/World';
import { IconPeople, IconPlanet, IconPlot, IconRadius, IconRocks } from '../../icons';
import { RotatableCamera } from '../common/RotatableCamera/RotatableCamera';
import { type TileRenderMode } from './colors';
import { PlanetViewSceneLight } from './PlanetViewSceneLight';
import { PlanetViewScenePlanet } from './PlanetViewScenePlanet';
import { PlanetViewSceneAtmosphere } from './PlanetViewSceneAtmosphere';
import { dfWorlds } from '../../store/datafront';

export type PlanetViewSceneProps = {
    isActive: boolean;
    worldId: string;

    selectedPlotId?: string;
    onPlotSelected?: (plotId: string | undefined) => void;
};

export const PlanetViewScene: Component<PlanetViewSceneProps> = (props) => {
    const world = dfWorlds.useSingle(() => (props.isActive ? props.worldId : null));
    const [getTileRenderMode, setTileRenderMode] = createSignal<TileRenderMode>('natural');

    const activeTileIndex = createMemo(
        () => (props.selectedPlotId && World.parseTileId(props.selectedPlotId)) || undefined,
    );

    const onTileClick = (tile: number | undefined) => {
        if (props.onPlotSelected) {
            props.onPlotSelected(tile === undefined ? undefined : World.makeTileId(tile));
        }
    };

    const setTRMNatural = () => setTileRenderMode('natural');
    const setTRMBiomes = () => setTileRenderMode('biomes');
    const setTRMPopulation = () => setTileRenderMode('population');
    const setTRMResources = () => setTileRenderMode('resources');
    const setTRMElevations = () => setTileRenderMode('elevations');

    return (
        <Show when={props.isActive && world.result()}>
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
                world={world.result()}
                activeTileIndex={activeTileIndex()}
                onTileClick={onTileClick}
                tileRenderMode={getTileRenderMode()}
            />
            <PlanetViewSceneAtmosphere isNatural={getTileRenderMode() === 'natural'} density={0.6} />

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
