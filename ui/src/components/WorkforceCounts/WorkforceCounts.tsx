import { type Component, createMemo, For } from 'solid-js';
import { Badge } from '@/atoms';
import { WORKFORCE_TYPES, type WorkforceData, type WorkforceType } from '@/domain/City';
import {
    type Icon,
    IconFlask,
    IconFlaskChevron,
    IconGraduate,
    IconTie,
    IconTieChevron,
    IconWorker,
    IconWorkerChevron,
    IconWrenchCog,
    IconWrenchCogChevron,
} from '@/icons';

export type WorkforceCountsProps = {
    counts: WorkforceData<number>;
};

export const wfIcons: Record<WorkforceType, Icon> = {
    intern: IconGraduate,
    worker: IconWorker,
    foreman: IconWorkerChevron,
    manager: IconTie,
    clevel: IconTieChevron,
    engineer: IconWrenchCog,
    senior: IconWrenchCogChevron,
    researcher: IconFlask,
    scientist: IconFlaskChevron,
};

export const WorkforceCounts: Component<WorkforceCountsProps> = (props) => {
    const counts = createMemo(() => {
        const result: { type: WorkforceType; count: number }[] = [];
        const counts = props.counts;

        for (const type of WORKFORCE_TYPES) {
            if (!counts[type]) {
                continue;
            }

            result.push({ type, count: counts[type] });
        }

        return result;
    });

    return (
        <For each={counts()}>
            {({ type, count }) => (
                <Badge style="transparent" iconLeft={wfIcons[type]}>
                    {count.toFixed()}
                </Badge>
            )}
        </For>
    );
};
