import { createMemo, For, Show, type Component } from 'solid-js';
import { Group } from '@/atoms';
import { type Building, type Equipment } from '@/domain/Base';
import { buildingsAsset } from '@/lib/assetmanager';
import { mapValues } from '@/lib/misc';
import { useAsset } from '@/lib/solid/asset';
import {
    EquipmentOverview,
    type EquipmentRequirement,
    type EquipmentRequirementStatus,
} from '../EquipmentOverview/EquipmentOverview';
import styles from './EquipmentSelectionList.module.css';

export type EquipmentSelectionListProps = {
    availableArea?: number;
    availableResources?: {
        soil: EquipmentRequirementStatus;
        minerals: EquipmentRequirementStatus;
        liquids: EquipmentRequirementStatus;
        gases: EquipmentRequirementStatus;
    };

    selectedCounts?: Record<string, number>;
    onCountChange?: (id: string, value: number) => void;
};

const EquipmentListItem: Component<
    EquipmentSelectionListProps & {
        equipmentData: Equipment;
        buildingData: Building | undefined;
    }
> = (props) => {
    const area = createMemo<EquipmentRequirement>(() => {
        const enoughArea = props.equipmentData.area <= (props.availableArea ?? Infinity);

        return {
            value: props.equipmentData.area.toFixed(0),
            status: enoughArea ? 'ok' : 'none',
        };
    });

    const buildingMats = createMemo(() => {
        const mats = props.buildingData?.matsPerArea ?? {};
        return mapValues(
            mats,
            (n): EquipmentRequirement => ({ value: (n * props.equipmentData.area).toFixed(0), status: 'ok' }),
        );
    });
    const workforce = createMemo(() => {
        return mapValues(
            props.equipmentData.workforce,
            ({ count }): EquipmentRequirement => ({
                value: count.toFixed(0),
                status: 'ok',
            }),
        );
    });

    const requirements = createMemo(() => {
        const availableResources = props.availableResources ?? {
            soil: 'ok',
            minerals: 'ok',
            liquids: 'ok',
            gases: 'ok',
        };

        return {
            soil: props.equipmentData.requiresSoil
                ? { value: availableResources.soil, status: availableResources.soil }
                : undefined,
            minerals: props.equipmentData.requiresMinerals
                ? { value: availableResources.minerals, status: availableResources.minerals }
                : undefined,
            liquids: props.equipmentData.requiresLiquids
                ? { value: availableResources.liquids, status: availableResources.liquids }
                : undefined,
            gases: props.equipmentData.requiresGases
                ? { value: availableResources.gases, status: availableResources.gases }
                : undefined,
        };
    });

    return (
        <Group style="bleak">
            <EquipmentOverview
                name={props.equipmentData.id}
                area={area()}
                building={props.equipmentData.building}
                buildingMats={buildingMats()}
                workforce={workforce()}
                {...requirements()}
                count={props.selectedCounts ? props.selectedCounts[props.equipmentData.id] ?? 0 : undefined}
                onCountChange={props.onCountChange ? (c) => props.onCountChange!(props.equipmentData.id, c) : undefined}
            />
        </Group>
    );
};

export const EquipmentSelectionList: Component<EquipmentSelectionListProps> = (props) => {
    const buildings = useAsset(buildingsAsset);
    const allEquipment = createMemo(() => {
        const buildingsData = buildings();
        if (!buildingsData) {
            return [];
        }

        return Object.values(buildingsData.equipment).map((equipmentData) => {
            const buildingData = buildingsData.buildings[equipmentData.building];
            return { equipmentData, buildingData };
        });
    });

    return (
        <ul class={styles.list}>
            <For each={allEquipment()} fallback={<Show when={!buildings()}>Loading...</Show>}>
                {({ buildingData, equipmentData }) => {
                    return (
                        <li class={styles.item}>
                            <EquipmentListItem equipmentData={equipmentData} buildingData={buildingData} {...props} />
                        </li>
                    );
                }}
            </For>
        </ul>
    );
};
