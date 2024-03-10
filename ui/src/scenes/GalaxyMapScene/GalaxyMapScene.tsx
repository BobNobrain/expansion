import { type Component, createMemo, Show, createEffect } from 'solid-js';

import { RotatableCamera } from '../common/RotatableCamera/RotatableCamera';
import { Point2D } from '../../lib/math/2d';
import { FloatingHTML } from '../../components/three/FloatingHTML/FloatingHTML';
import { Text } from '../../components/Text/Text';
import { useGalaxyGrid } from '../../store/galaxy';

import { FULL_CIRCLE } from './constants';
import { type Sector, divideGalaxy } from './sectors';
import { generateStars } from './stars';
import { GalaxyStars } from './GalaxyStars';
import { GalaxySectorsGrid } from './GalaxySectorsGrid';
import { GalaxyMapActiveSector } from './GalaxyMapActiveSector';

export type GalaxyMapSceneProps = {
    selectedSector: string | null;
    onSectorClick: (id: string | undefined) => void;
};

export const GalaxyMapScene: Component<GalaxyMapSceneProps> = (props) => {
    const { verticies, colors } = generateStars();
    const { sectors } = divideGalaxy();

    const galaxyGrid = useGalaxyGrid();
    createEffect(() => {
        console.log({ grid: galaxyGrid.data });
    });

    const sectorsByName: Record<string, Sector> = {};

    for (const sector of sectors) {
        sectorsByName[sector.name] = sector;
    }

    const selectedSector = createMemo(() => {
        const selectedSectorName = props.selectedSector;
        console.log({ selectedSectorName, s: sectorsByName[selectedSectorName || ''] });
        if (!selectedSectorName) {
            return null;
        }
        return sectorsByName[selectedSectorName] ?? null;
    });

    const onSectorClick = (sector: Sector | null) => {
        let nStarsInside = 0;
        if (sector) {
            for (const [x, , z] of verticies) {
                const r = Math.sqrt(x * x + z * z);
                if (r < sector.innerR || sector.outerR < r) {
                    continue;
                }
                let theta = Point2D.angle({ x: 1, y: 0 }, { x, y: z });
                if (theta < 0) {
                    theta += FULL_CIRCLE;
                }
                if (theta < sector.thetaStart || sector.thetaEnd < theta) {
                    continue;
                }

                ++nStarsInside;
            }
        }

        console.log(sector, { nStarsInside });

        props.onSectorClick(sector ? sector.name : undefined);
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

    const deselectSector = () => props.onSectorClick(undefined);

    return (
        <>
            <GalaxyStars positions={verticies} colors={colors} />
            <GalaxySectorsGrid sectors={sectors} isActive={!selectedSector()} onClick={onSectorClick} />
            <GalaxyMapActiveSector sector={selectedSector()} onClickOff={deselectSector} />
            <RotatableCamera main pannable minDistance={0.1} maxDistance={6} yawInertia={0.95} pitchInertia={0.9} />
            <Show when={selectedSector()}>
                <FloatingHTML
                    x={selectedSectorCenterCoords()!.x}
                    y={selectedSectorCenterCoords()!.y}
                    z={selectedSectorCenterCoords()!.z}
                >
                    <div style="pointer-events: none">
                        <Text color="primary">{selectedSector()!.name}</Text>
                    </div>
                </FloatingHTML>
            </Show>
        </>
    );
};
