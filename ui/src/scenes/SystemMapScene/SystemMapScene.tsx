import { type Component, createMemo, For, Show } from 'solid-js';
import { type PanLimits, RotatableCamera } from '../common/RotatableCamera/RotatableCamera';
import { type RawVertex } from '../../lib/3d/types';
import { SystemMapSceneOrbit } from './SystemMapSceneOrbit';
import { SystemMapSceneStar } from './SystemMapSceneStar';
import { SystemMapSceneGrid } from './SystemMapSceneGrid';
import { dfSystems } from '../../store/datafront';

export type SystemMapSceneProps = {
    isActive: boolean;
    systemId: string;
};

export const SystemMapScene: Component<SystemMapSceneProps> = (props) => {
    const systemContent = dfSystems.useSingle(() => (props.isActive ? props.systemId : null));

    const systemSize = createMemo<number>(() => {
        const content = systemContent.result();
        if (!content) {
            return 0;
        }

        let maxSize = 0;
        for (const [, orbit] of Object.entries(content.orbits)) {
            maxSize = Math.max(maxSize, orbit.semiMajorAu);
        }

        return maxSize * 1.1;
    });

    const panLimits = createMemo<PanLimits>(() => {
        const size = systemSize();

        return {
            x: { min: -size, max: size },
            y: { min: 0, max: 0 },
            z: { min: -size, max: size },
        };
    });

    const panPlaneNormal: RawVertex = [0, 1, 0];
    const panSpeed = (d: number) => 3e-4 * d;

    return (
        <Show when={props.isActive}>
            <RotatableCamera
                main
                near={0.01}
                far={1000}
                minDistance={0.1}
                maxDistance={200}
                initialPitch={0}
                yawInertia={0.95}
                pitchInertia={0.9}
                pannable
                panLimits={panLimits()}
                panPlaneNormal={panPlaneNormal}
                panSpeed={panSpeed}
            />

            <Show when={systemContent.result()}>
                <SystemMapSceneGrid outsideBorder={systemSize()} />

                <For each={Object.values(systemContent.result()!.orbits)}>
                    {(orbit) => <SystemMapSceneOrbit orbit={orbit} />}
                </For>

                <For each={systemContent.result()!.stars}>
                    {(star) => (
                        <SystemMapSceneStar star={star} orbit={systemContent.result()!.orbits[star.id] ?? null} />
                    )}
                </For>
            </Show>
        </Show>
    );
};
