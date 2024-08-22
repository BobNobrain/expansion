import { type Component, createMemo, For, Show, createEffect } from 'solid-js';
import { type PanLimits, RotatableCamera } from '../common/RotatableCamera/RotatableCamera';
import { type RawVertex } from '../../lib/3d/types';
import { useSystemContent } from '../../store/galaxy';
import { SystemMapSceneOrbit } from './SystemMapSceneOrbit';
import { SystemMapSceneStar } from './SystemMapSceneStar';
import { SystemMapSceneGrid } from './SystemMapSceneGrid';

export type SystemMapSceneProps = {
    isActive: boolean;
    systemId: string;
};

export const SystemMapScene: Component<SystemMapSceneProps> = (props) => {
    const systemContent = useSystemContent(() => (props.isActive ? props.systemId : ''));

    createEffect(() => console.log({ ...systemContent.data }));

    const systemSize = createMemo<number>(() => {
        const content = systemContent.data;
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

            <Show when={systemContent.data}>
                <SystemMapSceneGrid outsideBorder={systemSize()} />

                <For each={Object.values(systemContent.data!.orbits)}>
                    {(orbit) => <SystemMapSceneOrbit orbit={orbit} />}
                </For>

                <For each={systemContent.data!.stars}>
                    {(star) => <SystemMapSceneStar star={star} orbit={systemContent.data!.orbits[star.id] ?? null} />}
                </For>
            </Show>
        </Show>
    );
};
