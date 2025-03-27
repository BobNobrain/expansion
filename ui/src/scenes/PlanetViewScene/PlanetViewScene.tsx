import { createMemo, Show, type Component } from 'solid-js';
import { World } from '../../domain/World';
import { remap } from '../../lib/math/misc';
import { dfWorlds } from '../../store/datafront';
import { PVSAtmosphere } from './PVSAtmosphere';
import { PVSCamera } from './PVSCamera';
import { PVSLights } from './PVSLights';
import { PVSObjects } from './PVSObjects';
import { PVSPlanet } from './PVSPlanet';
import { PVSSettings } from './PVSSettings';
import { createPlanetViewSceneSettings } from './settings';

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
            return remap(pressureBar, { from: [2, 10], to: [0.8, 1.0] });
        }

        return 1.0;
    });

    const currentTileCoords = createMemo(() => {
        if (!props.selectedPlotId) {
            return null;
        }

        const tileIndex = World.parseTileId(props.selectedPlotId);
        if (tileIndex === undefined) {
            return null;
        }

        const w = world.result();
        if (!w) {
            return null;
        }

        return World.getTileCoords(w.grid, tileIndex);
    });

    return (
        <Show when={props.isActive && world.result()}>
            <PVSCamera selectedTileCoords={currentTileCoords()} />
            <PVSLights isNatural={renderSettings.hasNaturalLighting()} />
            <PVSPlanet
                world={world.result()}
                activeTileIndex={activeTileIndex()}
                onTileClick={onTileClick}
                tileRenderMode={renderSettings.getMode()}
                showBorders={renderSettings.showBorders()}
            />
            <PVSObjects world={world.result()} />
            <PVSAtmosphere isNatural={renderSettings.hasNaturalLighting()} density={atmDensity()} />

            <PVSSettings {...renderSettings} isFertilePlanet={Boolean(world.result()?.soilFertilities)} />
        </Show>
    );
};
