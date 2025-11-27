import { createEffect, createMemo, createSignal, type Component } from 'solid-js';
import { Button, PageHeader, PageHeaderActions, PageHeaderIcon, PageHeaderTitle } from '@/atoms';
import type { EquipmentRequirementStatus } from '@/components/EquipmentOverview/EquipmentOverview';
import {
    EquipmentSelectionList,
    type EquipmentSelectionListProps,
} from '@/components/EquipmentSelectionList/EquipmentSelectionList';
import type { FactoryEquipment } from '@/domain/Base';
import { WorkforceData } from '@/domain/City';
import type { ResourceDeposit } from '@/domain/World';
import { IconArea, IconEquipment } from '@/icons';
import { buildingsAsset } from '@/lib/assetmanager';
import { useAsset } from '@/lib/solid/asset';
import { formatInteger } from '@/lib/strings';
import { TouchBottomSheet } from '@/touch/components/TouchBottomSheet/TouchBottomSheet';
import { useFactoryDisplayContext } from '../state';

export const SelectEquipmentSheet: Component<{
    isOpen: boolean;
    setIsOpen: (v: boolean) => void;
}> = (props) => {
    const buildings = useAsset(buildingsAsset);
    const { state, updateState, tileConditions, availableArea } = useFactoryDisplayContext();

    const equipmentCounts = createMemo(() => {
        const eqs = state.factoryEquipment;
        const result: Record<string, number> = {};

        for (const eq of eqs) {
            result[eq.equipmentId] = (result[eq.equipmentId] ?? 0) + eq.count;
        }
        return result;
    });

    const [getCounts, setCounts] = createSignal<Record<string, number>>(equipmentCounts());
    createEffect(() => {
        setCounts(equipmentCounts());
    });

    const totalCount = createMemo(() => Object.values(getCounts()).reduce((acc, next) => acc + next, 0));
    const totalArea = createMemo(() => {
        const buildingsData = buildings();
        if (!buildingsData) {
            return 0;
        }

        const c = getCounts();
        return Object.keys(c).reduce((acc, next) => acc + c[next] * buildingsData.equipment[next].area, 0);
    });

    const availableResources = createMemo(() => {
        const conditions = tileConditions();
        const result: EquipmentSelectionListProps['availableResources'] = {
            gases: calcResourceDepositStatus(conditions.atmosphericResources),
            liquids: calcResourceDepositStatus(conditions.oceanResources),
            minerals: calcResourceDepositStatus(conditions.resources),
            soil: 'none',
        };

        switch (true) {
            case conditions.soilFertility > 0.5:
                result.soil = 'good';
                break;

            case conditions.soilFertility > 0:
                result.soil = 'bad';
                break;
        }

        return result;
    });

    const updateCounts = () => {
        updateState('factoryEquipment', (eqs): FactoryEquipment[] => {
            const counts = getCounts();
            const newIds = new Set(Object.keys(counts));

            const copy = eqs
                .map((eq) => {
                    newIds.delete(eq.equipmentId);
                    return { ...eq, count: counts[eq.equipmentId] };
                })
                .filter((eq) => eq.count > 0);

            for (const newId of newIds.values()) {
                const count = counts[newId];
                if (!count) {
                    continue;
                }

                const newEq: FactoryEquipment = {
                    equipmentId: newId,
                    count,
                    employees: WorkforceData.empty<number>(),
                    production: {},
                };
                copy.push(newEq);
            }

            return copy;
        });
    };

    return (
        <TouchBottomSheet
            isOpen={props.isOpen}
            onClose={() => {
                props.setIsOpen(false);
            }}
            header={
                <PageHeader>
                    <PageHeaderTitle>Add</PageHeaderTitle>
                    <PageHeaderIcon icon={IconEquipment} text={formatInteger(totalCount())} />
                    <PageHeaderIcon icon={IconArea} text={totalArea().toFixed(0)} />
                    <PageHeaderActions pushRight>
                        <Button
                            onClick={() => {
                                updateCounts();
                                props.setIsOpen(false);
                            }}
                        >
                            Confirm
                        </Button>
                    </PageHeaderActions>
                </PageHeader>
            }
        >
            <EquipmentSelectionList
                selectedCounts={getCounts()}
                onCountChange={(id, value) => {
                    const normalizedValue = Math.floor(Math.max(0, value));
                    setCounts((old) => ({ ...old, [id]: normalizedValue }));
                }}
                availableArea={availableArea()}
                availableResources={availableResources()}
            />
        </TouchBottomSheet>
    );
};

function calcResourceDepositStatus(deps: ResourceDeposit[]): EquipmentRequirementStatus {
    if (!deps.length) {
        return 'none';
    }

    const maxAbundance = deps.reduce((acc, d) => Math.max(acc, d.abundance), 0);
    if (maxAbundance > 0.5) {
        return 'good';
    }

    return 'bad';
}
