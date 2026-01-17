import { createMemo, createSignal, For, Show, type Component, type JSX } from 'solid-js';
import {
    Button,
    Container,
    Group,
    GroupHeader,
    InfoDisplay,
    PageHeader,
    PageHeaderActions,
    PageHeaderIcon,
    PageHeaderTitle,
    Spacer,
    Text,
} from '@/atoms';
import { EquipmentIcon } from '@/components/EquipmentIcon/EquipmentIcon';
import { IconBalance, IconCross, IconEquipment, IconHammer, IconHandbook, IconProduction, IconTick } from '@/icons';
import { useFactoryDisplayContext } from '../state';
import { FactoryDisplayProductionList } from './FactoryDisplayProductionList';
import { SelectEquipmentSheet } from './SelectEquipmentSheet';
import { SelectRecipeSheet } from './SelectRecipeSheet';

const EquipmentActions: Component = () => {
    const { state, updateState, isEditable, isRebalanceEnabled, onRebalance, isRebalanceInProgress, resetState } =
        useFactoryDisplayContext();

    const content = createMemo((): JSX.Element[] => {
        const editable = isEditable();
        const isEditing = state.isEditingEfficiencies;
        const isRebalanceable = isRebalanceEnabled();

        if (!editable && isRebalanceable && isEditing) {
            return [
                <Button
                    style="light"
                    square
                    loading={isRebalanceInProgress()}
                    onClick={() => {
                        updateState('isEditingEfficiencies', false);
                        resetState();
                    }}
                >
                    <IconCross size={32} />
                </Button>,
                <Button
                    style="light"
                    square
                    loading={isRebalanceInProgress()}
                    onClick={() => {
                        onRebalance({ target: state.factoryEquipment });
                        updateState('isEditingEfficiencies', false);
                    }}
                >
                    <IconTick size={32} color="success" />
                </Button>,
            ];
        }

        const result: JSX.Element[] = [
            <Button style="light" square>
                <IconHandbook size={32} />
            </Button>,
        ];

        if (editable || isRebalanceable) {
            result.push(
                <Button
                    style="light"
                    color={isEditing ? 'primary' : undefined}
                    square
                    loading={isRebalanceInProgress()}
                    onClick={() => {
                        updateState('isEditingEfficiencies', true);
                    }}
                >
                    <IconBalance size={32} />
                </Button>,
            );
        }

        return result;
    });

    return <PageHeaderActions pushRight>{content()}</PageHeaderActions>;
};

export const FactoryDisplayEquipment: Component = () => {
    const { state, updateState, isEditable } = useFactoryDisplayContext();
    const [isProductionSheetOpen, setProductionSheetOpen] = createSignal(false);
    const [isEquipmentSheetOpen, setEquipmentSheetOpen] = createSignal(false);

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>Equipment</PageHeaderTitle>
                <PageHeaderIcon icon={IconEquipment} text={state.factoryEquipment.length.toString()} />
                <EquipmentActions />
            </PageHeader>
            <Container hasGap>
                <For
                    each={state.factoryEquipment}
                    fallback={
                        <InfoDisplay
                            title="No equipment selected"
                            actions={
                                <Show when={isEditable()}>
                                    <Button color="primary" onClick={() => setEquipmentSheetOpen(true)}>
                                        Add equipment
                                    </Button>
                                </Show>
                            }
                        >
                            <Show when={isEditable()} fallback="This factory has no equipment installed.">
                                Your equpment selection is empty. Add new equipment using the button below or{' '}
                                <IconHammer size={16} /> button above. After that, you can select recipes to run on that
                                equipment.
                            </Show>
                        </InfoDisplay>
                    }
                >
                    {(equipment, index) => {
                        return (
                            <Group padding="none">
                                <GroupHeader padding="h">
                                    <EquipmentIcon
                                        equipmentId={equipment.equipmentId}
                                        size="md"
                                        badge={equipment.count}
                                    />
                                    <Text size="h2" ellipsis>
                                        {equipment.equipmentId}
                                    </Text>
                                    <Show when={isEditable()}>
                                        <Spacer />
                                        <Button
                                            style="light"
                                            square
                                            onClick={() => {
                                                updateState('equipmentIndexForRecipeSelector', index());
                                                setProductionSheetOpen(true);
                                            }}
                                        >
                                            <IconProduction size={32} />
                                        </Button>
                                    </Show>
                                </GroupHeader>
                                <FactoryDisplayProductionList equipment={equipment} />
                            </Group>
                        );
                    }}
                </For>
            </Container>

            <SelectEquipmentSheet isOpen={isEquipmentSheetOpen()} setIsOpen={setEquipmentSheetOpen} />

            <SelectRecipeSheet isOpen={isProductionSheetOpen()} setIsOpen={setProductionSheetOpen} />
        </>
    );
};
