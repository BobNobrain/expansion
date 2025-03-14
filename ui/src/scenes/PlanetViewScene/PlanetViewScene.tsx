import { createMemo, Show, type Component } from 'solid-js';
import { RotatableCamera } from '../../components/three/RotatableCamera/RotatableCamera';
import { World } from '../../domain/World';
import { dfWorlds } from '../../store/datafront';
import { PVSAtmosphere } from './PVSAtmosphere';
import { PVSLights } from './PVSLights';
import { PVSPlanet } from './PVSPlanet';
import { PVSSettings } from './PVSSettings';
import { createPlanetViewSceneSettings } from './settings';
import { remap } from '../../lib/math/misc';

export type PlanetViewSceneProps = {
    isActive: boolean;
    worldId: string;

    selectedPlotId?: string;
    onPlotSelected?: (plotId: string | undefined) => void;
};

export const PlanetViewScene: Component<PlanetViewSceneProps> = (props) => {
    const world = dfWorlds.useSingle(() => (props.isActive ? props.worldId : null));

    const renderSettings = createPlanetViewSceneSettings();

    const activeTileIndex = createMemo(() => {
        if (!props.selectedPlotId) {
            return undefined;
        }

        return World.parseTileId(props.selectedPlotId);
    });

    const onTileClick = (tile: number | undefined) => {
        if (props.onPlotSelected) {
            props.onPlotSelected(tile === undefined ? undefined : World.makeTileId(tile));
        }
    };

    const atmDensity = createMemo(() => {
        const pressureBar = world.result()?.surface.pressureBar ?? 0.1;

        if (pressureBar < 0.01) {
            return 0.0;
        }
        if (pressureBar < 2) {
            return remap(pressureBar, { from: [0, 2], to: [0, 0.8] });
        }
        if (pressureBar < 10) {
            // 2..10 -> 0.5..1.0

            return remap(pressureBar, { from: [2, 10], to: [0.8, 1.0] });
        }

        return 1.0;
    });

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
            <PVSLights isNatural={renderSettings.hasNaturalLighting()} />
            <PVSPlanet
                world={world.result()}
                activeTileIndex={activeTileIndex()}
                onTileClick={onTileClick}
                tileRenderMode={renderSettings.getMode()}
                showBorders={renderSettings.showBorders()}
            />
            <PVSAtmosphere isNatural={renderSettings.hasNaturalLighting()} density={atmDensity()} />

            <PVSSettings {...renderSettings} isFertilePlanet={Boolean(world.result()?.soilFertilities)} />
        </Show>
    );
};
