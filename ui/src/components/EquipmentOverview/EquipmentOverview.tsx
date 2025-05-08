import { createMemo, createSignal, For, Show, type Component } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { type WorkforceType } from '../../domain/City';
import {
    type Icon,
    IconArea,
    IconBarrel,
    IconCity,
    IconCloud,
    IconFactory,
    IconFlask,
    IconFlaskChevron,
    IconGraduate,
    IconHammer,
    IconLeaf,
    IconRocks,
    IconTie,
    IconTieChevron,
    IconUnknown,
    IconWave,
    IconWorker,
    IconWorkerChevron,
    IconWrenchCog,
    IconWrenchCogChevron,
} from '../../icons';
import { type SemanticColor } from '../../lib/appearance';
import { Badge } from '../Badge/Badge';
import { Button } from '../Button/Button';
import { CommodityIconWithLabel } from '../CommodityIcon';
import { NumberInput } from '../NumberInput/NumberInput';
import { Text } from '../Text/Text';
import styles from './EquipmentOverview.module.css';
import { stopPropagation } from '../../lib/misc';

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
    buildingMats: Record<string, EquipmentRequirement>;

    soil?: EquipmentRequirement;
    minerals?: EquipmentRequirement;
    liquids?: EquipmentRequirement;
    gases?: EquipmentRequirement;

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

const buildingIcons: Record<string, Icon> = {
    facility: IconFactory,
    mine: IconRocks,
    farmland: IconLeaf,
    office: IconCity,
    rig: IconBarrel,
};

export const EquipmentOverview: Component<EquipmentOverviewProps> = (props) => {
    const [isExpanded, setExpanded] = createSignal(false);
    const toggleExpanded = () => setExpanded((x) => !x);

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
        <div class={styles.wrapper} classList={{ [styles.expanded]: isExpanded() }} onClick={toggleExpanded}>
            <div class={styles.main}>
                <div class={styles.icon}>
                    <Dynamic component={buildingIcons[props.building] ?? IconUnknown} size={48} />
                </div>
                <div class={styles.info}>
                    <div class={styles.topLine}>
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
                                        disabled={!props.onCountChange}
                                        onClick={() => props.onCountChange!(1)}
                                        stopPropagation
                                    >
                                        <IconHammer size={20} />
                                    </Button>
                                }
                            >
                                <NumberInput value={props.count} onUpdate={props.onCountChange} noIcon noErrorMessage />
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
                                <IconUnknown size={16} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <ul class={styles.cost}>
                <For each={Object.entries(props.buildingMats)}>
                    {([commodity, { value, status }]) => {
                        return (
                            <li class={styles.material}>
                                <CommodityIconWithLabel
                                    commodity={commodity}
                                    badge={
                                        <Text color={getStatusColor(status, 'bright')} size="small">
                                            {value}
                                        </Text>
                                    }
                                />
                            </li>
                        );
                    }}
                </For>
            </ul>
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
