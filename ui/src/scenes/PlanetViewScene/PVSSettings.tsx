import { createMemo, For, type Component } from 'solid-js';
import { SceneControls, SceneControlsButton, SceneControlsRadioGroup } from '@/components/SceneControls';
import {
    type Icon,
    IconCloud,
    IconEye,
    IconEyeCog,
    IconLeaf,
    IconPlanet,
    IconTile,
    IconTileOutline,
    IconRadius,
    IconRocks,
} from '@/icons';
import { type PlanetViewSceneSettingsState, type RenderMode } from './settings';

export type PVSSettingsProps = PlanetViewSceneSettingsState & {
    isFertilePlanet: boolean;
};

const SettingsModeTrigger: Component<{
    icon: Icon;
    activeMode: RenderMode;
    mode: RenderMode;
    setMode: (m: RenderMode) => void;
}> = (props) => {
    const onClick = () => props.setMode(props.mode);

    return <SceneControlsButton icon={props.icon} isActive={props.mode === props.activeMode} onClick={onClick} />;
};

const modeIcons: Record<RenderMode, Icon> = {
    natural: IconEye,
    biomes: IconTile,
    soil: IconLeaf,
    moisture: IconCloud,
    elevations: IconRadius,
    resources: IconRocks,
};

export const PVSSettings: Component<PVSSettingsProps> = (props) => {
    const availableRenderModes = createMemo<RenderMode[]>(() => {
        const result: RenderMode[] = ['natural', 'biomes', 'resources'];

        if (props.isFertilePlanet) {
            result.push('soil', 'moisture');
        }

        result.push('elevations');

        return result;
    });

    return (
        <SceneControls>
            <SceneControlsButton
                icon={IconPlanet}
                isActive={props.hasNaturalLighting()}
                onClick={props.toggleNaturalLighting}
            />
            <SceneControlsRadioGroup triggerIcon={modeIcons[props.getMode()]} activeTriggerIcon={IconEyeCog}>
                <For each={availableRenderModes()}>
                    {(renderMode) => (
                        <SettingsModeTrigger
                            icon={modeIcons[renderMode]}
                            mode={renderMode}
                            activeMode={props.getMode()}
                            setMode={props.setMode}
                        />
                    )}
                </For>
            </SceneControlsRadioGroup>
            <SceneControlsButton
                icon={IconTileOutline}
                isActive={props.showBorders()}
                onClick={props.toggleShowBorders}
            />
        </SceneControls>
    );
};
