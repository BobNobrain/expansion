import { createMemo, For, Show, type Component } from 'solid-js';
import { List, ListItem } from '@/atoms';
import { type Building, type Equipment } from '@/domain/Base';
import { buildingsAsset } from '@/lib/assetmanager';
import { mapValues } from '@/lib/misc';
import { useAsset } from '@/lib/solid/asset';
import {
    EquipmentOverview,
    type EquipmentRequirement,
    type EquipmentRequirementStatus,
} from '../EquipmentOverview/EquipmentOverview';

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

    const disabled = createMemo(() => {
        const reqs = requirements();
        const hasInsufficientResources =
            reqs.soil?.status === 'none' ||
            reqs.minerals?.status === 'none' ||
            reqs.liquids?.status === 'none' ||
            reqs.gases?.status === 'none';
        return hasInsufficientResources && (props.selectedCounts?.[props.equipmentData.id] ?? 0) === 0;
    });

    return (
        <EquipmentOverview
            name={props.equipmentData.id}
            area={area()}
            building={props.equipmentData.building}
            workforce={workforce()}
            {...requirements()}
            disabled={disabled()}
            count={props.selectedCounts ? props.selectedCounts[props.equipmentData.id] ?? 0 : undefined}
            onCountChange={props.onCountChange ? (c) => props.onCountChange!(props.equipmentData.id, c) : undefined}
        />
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
        <List striped>
            <For each={allEquipment()} fallback={<Show when={!buildings()}>Loading...</Show>}>
                {({ buildingData, equipmentData }) => {
                    return (
                        <ListItem selected={(props.selectedCounts?.[equipmentData.id] ?? 0) > 0}>
                            <EquipmentListItem equipmentData={equipmentData} buildingData={buildingData} {...props} />
                        </ListItem>
                    );
                }}
            </For>
        </List>
    );
};
