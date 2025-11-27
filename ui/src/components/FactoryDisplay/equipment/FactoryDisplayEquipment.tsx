import { createSignal, For, Show, type Component } from 'solid-js';
import {
    Button,
    Container,
    Group,
    GroupHeader,
    InfoDisplay,
    List,
    ListItem,
    PageHeader,
    PageHeaderActions,
    PageHeaderIcon,
    PageHeaderTitle,
    Spacer,
    Text,
} from '@/atoms';
import { EquipmentIcon } from '@/components/EquipmentIcon/EquipmentIcon';
import { IconCog, IconEquipment, IconHammer, IconHandbook, IconProduction } from '@/icons';
import { useFactoryDisplayContext } from '../state';
import { SelectEquipmentSheet } from './SelectEquipmentSheet';
import { SelectRecipeSheet } from './SelectRecipeSheet';
import { FactoryDisplayProductionItem } from './FactoryDisplayProductionItem';

export const FactoryDisplayEquipment: Component = () => {
    const { state, updateState } = useFactoryDisplayContext();
    const [isProductionSheetOpen, setProductionSheetOpen] = createSignal(false);
    const [isEquipmentSheetOpen, setEquipmentSheetOpen] = createSignal(false);

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>Equipment</PageHeaderTitle>
                <PageHeaderIcon icon={IconEquipment} text={state.factoryEquipment.length.toString()} />
                <PageHeaderActions pushRight>
                    <Button style="light" square>
                        <IconHandbook size={32} />
                    </Button>
                    <Show when={state.isEditable}>
                        <Button
                            style="light"
                            color={state.isEditingEfficiencies ? 'primary' : undefined}
                            square
                            onClick={() => updateState('isEditingEfficiencies', (v) => !v)}
                        >
                            <IconCog size={32} />
                        </Button>
                        <Button style="light" square onClick={() => setEquipmentSheetOpen(true)}>
                            <IconHammer size={32} />
                        </Button>
                    </Show>
                </PageHeaderActions>
            </PageHeader>
            <Container hasGap padded>
                <For
                    each={state.factoryEquipment}
                    fallback={
                        <InfoDisplay
                            title="No equipment selected"
                            actions={
                                <Button color="primary" onClick={() => setEquipmentSheetOpen(true)}>
                                    Add equipment
                                </Button>
                            }
                        >
                            Your equpment selection is empty. Add new equipment using the button below or{' '}
                            <IconHammer size={16} /> button above. After that, you can select recipes to run on that
                            equipment.
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
                                    <Show when={state.isEditable}>
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
                                <List striped>
                                    <For
                                        each={Object.values(equipment.production)}
                                        fallback={
                                            <InfoDisplay>
                                                No recipes selected. Use the <IconProduction size={16} /> button above
                                                on this equipment to select a recipe that will be run by this equipment.
                                            </InfoDisplay>
                                        }
                                    >
                                        {(item) => {
                                            return (
                                                <ListItem>
                                                    <FactoryDisplayProductionItem
                                                        equipment={equipment}
                                                        recipeId={item.recipeId}
                                                        efficiencyEditable={state.isEditingEfficiencies}
                                                        onShareUpdate={(efficiency) =>
                                                            updateState(
                                                                'factoryEquipment',
                                                                index(),
                                                                'production',
                                                                String(item.recipeId),
                                                                { manualEfficiency: efficiency },
                                                            )
                                                        }
                                                    />
                                                </ListItem>
                                            );
                                        }}
                                    </For>
                                </List>
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
