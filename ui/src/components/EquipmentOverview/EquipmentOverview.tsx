import { createMemo, For, Show, type Component } from 'solid-js';
import { Badge, Button, NumberInput, Text } from '@/atoms';
import { type WorkforceType } from '@/domain/City';
import {
    type Icon,
    IconArea,
    IconCloud,
    IconFlask,
    IconFlaskChevron,
    IconGraduate,
    IconHandbook,
    IconLeaf,
    IconPlus,
    IconRocks,
    IconTie,
    IconTieChevron,
    IconUnknown,
    IconWave,
    IconWorker,
    IconWorkerChevron,
    IconWrenchCog,
    IconWrenchCogChevron,
} from '@/icons';
import { type SemanticColor } from '@/lib/appearance';
import { stopPropagation } from '@/lib/misc';
import styles from './EquipmentOverview.module.css';
import { EquipmentIcon } from '../EquipmentIcon/EquipmentIcon';

export type EquipmentRequirementStatus = 'none' | 'bad' | 'ok' | 'good';

export type EquipmentRequirement = {
    value: string;
    status: EquipmentRequirementStatus;
};

export type EquipmentOverviewProps = {
    name: string;
    workforce: Partial<Record<WorkforceType, EquipmentRequirement>>;
    area: EquipmentRequirement;
    building: string;

    soil?: EquipmentRequirement;
    minerals?: EquipmentRequirement;
    liquids?: EquipmentRequirement;
    gases?: EquipmentRequirement;
    disabled?: boolean;

    count?: number;
    onCountChange?: (newValue: number) => void;
};

const wfIcons: Record<WorkforceType, Icon> = {
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

export const EquipmentOverview: Component<EquipmentOverviewProps> = (props) => {
    const badges = createMemo(() => {
        const result: (EquipmentRequirement & { icon: Icon })[] = [{ ...props.area, icon: IconArea }];

        if (props.soil) {
            result.push({ ...props.soil, icon: IconLeaf });
        }
        if (props.minerals) {
            result.push({ ...props.minerals, icon: IconRocks });
        }
        if (props.liquids) {
            result.push({ ...props.liquids, icon: IconWave });
        }
        if (props.gases) {
            result.push({ ...props.gases, icon: IconCloud });
        }

        for (const wf of Object.keys(props.workforce) as WorkforceType[]) {
            result.push({ ...props.workforce[wf]!, icon: wfIcons[wf as WorkforceType] ?? IconUnknown });
        }

        return result;
    });

    return (
        <div class={styles.main}>
            <div class={styles.topLine}>
                <EquipmentIcon equipmentId={props.name} size="sm" />
                <Text tag="div" size="h3" color="bright" class={styles.name}>
                    {props.name}
                </Text>
                <div class={styles.build} onClick={stopPropagation}>
                    <Show
                        when={props.count}
                        fallback={
                            <Button
                                square
                                style="light"
                                size="s"
                                disabled={!props.onCountChange || props.disabled}
                                onClick={() => props.onCountChange!(1)}
                                stopPropagation
                            >
                                <IconPlus size={20} />
                            </Button>
                        }
                    >
                        <NumberInput
                            value={props.count}
                            onUpdate={props.onCountChange}
                            noIcon
                            noErrorMessage
                            disabled={props.disabled}
                        />
                    </Show>
                </div>
            </div>
            <div class={styles.badges}>
                <For each={badges()}>
                    {({ icon, value, status }) => {
                        return (
                            <Badge style="transparent" iconLeft={icon} color={getStatusColor<never>(status)}>
                                {value}
                            </Badge>
                        );
                    }}
                </For>

                <div class={styles.help}>
                    <Button
                        square
                        style="light"
                        size="s"
                        onClick={(ev) => {
                            (ev as { handled?: boolean }).handled = true;
                        }}
                    >
                        <IconHandbook size={16} />
                    </Button>
                </div>
            </div>
        </div>
    );
};

function getStatusColor<C extends string>(status: EquipmentRequirementStatus, okColor?: C): SemanticColor | C {
    switch (status) {
        case 'none':
            return 'error';

        case 'bad':
            return 'warn';

        case 'ok':
            return okColor ?? 'secondary';

        case 'good':
            return 'success';
    }
}
