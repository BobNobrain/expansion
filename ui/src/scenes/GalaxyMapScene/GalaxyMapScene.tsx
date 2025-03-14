import { type Component, createMemo, Show } from 'solid-js';

import { FloatingHTML } from '../../components/three/FloatingHTML/FloatingHTML';
import { type PanLimits, RotatableCamera } from '../../components/three/RotatableCamera/RotatableCamera';
import { Text } from '../../components/Text/Text';
import { type GalacticGridSector } from '../../domain/GalacticOverview';
import { type RawVertex } from '../../lib/3d/types';
import { dfGalaxy } from '../../store/datafront';

import { GalaxyFog } from './GalaxyFog';
import { GalaxySectorsGrid } from './GalaxySectorsGrid';
import { GalaxyStars } from './GalaxyStars';

export type GalaxyMapSceneProps = {
    isActive: boolean;
    selectedSector: string | null;
    onSectorClick: (id: string | undefined) => void;
};

export const GalaxyMapScene: Component<GalaxyMapSceneProps> = (props) => {
    const overview = dfGalaxy.use();

    const selectedSector = createMemo(() => {
        const selectedSectorId = props.selectedSector;
        const data = overview.value();
        if (!selectedSectorId || !data) {
            return null;
        }
        return data.grid.getSectorById(selectedSectorId);
    });

    const onSectorClick = (sector: GalacticGridSector | null) => {
        props.onSectorClick(sector ? sector.id : undefined);
    };

    const selectedSectorCenterCoords = createMemo(() => {
        const sector = selectedSector();
        if (!sector) {
            return null;
        }
        const r = sector.innerR + (sector.outerR - sector.innerR) / 2;
        const theta = sector.thetaStart + (sector.thetaEnd - sector.thetaStart) / 2;
        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);
        return { x, y: 0, z };
    });

    const panLimits = createMemo<PanLimits>(() => {
        const grid = overview.value()?.grid;
        if (!grid) {
            return { x: { min: 0, max: 0 }, y: { min: 0, max: 0 }, z: { min: 0, max: 0 } };
        }

        return {
            x: { min: -grid.outerR, max: grid.outerR },
            // y: { min: -grid.maxH, max: grid.maxH },
            y: { min: 0, max: 0 },
            z: { min: -grid.outerR, max: grid.outerR },
        };
    });

    const panPlaneNormal: RawVertex = [0, 1, 0];
    const panSpeed = (d: number) => 3e-4 * d;

    return (
        <Show when={props.isActive}>
            <Show when={overview.value()}>
                <GalaxySectorsGrid
                    grid={overview.value()!.grid}
                    activeSectorId={props.selectedSector}
                    onClick={onSectorClick}
                />
                <GalaxyFog
                    innerR={overview.value()!.grid.innerR}
                    outerR={overview.value()!.grid.outerR}
                    maxH={overview.value()!.grid.maxH}
                />
            </Show>
            <GalaxyStars
                stars={overview.value()?.landmarks ?? []}
                withNormals
                dim={Boolean(!overview.value() || props.selectedSector)}
            />
            <RotatableCamera
                main
                near={0.01}
                far={20}
                minDistance={0.1}
                maxDistance={6}
                initialPitch={0}
                yawInertia={0.95}
                pitchInertia={0.9}
                pannable
                panLimits={panLimits()}
                panPlaneNormal={panPlaneNormal}
                panSpeed={panSpeed}
            />
            <Show when={selectedSector()}>
                <FloatingHTML
                    x={selectedSectorCenterCoords()!.x}
                    y={selectedSectorCenterCoords()!.y}
                    z={selectedSectorCenterCoords()!.z}
                >
                    <div style="pointer-events: none">
                        <Text color="primary">{selectedSector()!.id}</Text>
                    </div>
                </FloatingHTML>
            </Show>
        </Show>
    );
};
