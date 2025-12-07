import { createMemo, For, type Component } from 'solid-js';
import { List, InfoDisplay, ListItem } from '@/atoms';
import { Factory, type FactoryEquipmentPlan } from '@/domain/Base';
import { IconProduction } from '@/icons';
import { useFactoryDisplayContext } from '../state';
import { FactoryDisplayProductionItem } from './FactoryDisplayProductionItem';

export const FactoryDisplayProductionList: Component<{
    equipment: FactoryEquipmentPlan;
}> = (props) => {
    const { state, updateState } = useFactoryDisplayContext();
    const effectiveScales = createMemo((): number[] => Factory.getEffectiveScales(props.equipment));

    return (
        <List striped>
            <For
                each={props.equipment.production}
                fallback={
                    <InfoDisplay>
                        No recipes selected. Use the <IconProduction size={16} /> button above on this equipment to
                        select a recipe that will be run by this equipment.
                    </InfoDisplay>
                }
            >
                {(item, index) => {
                    return (
                        <ListItem>
                            <FactoryDisplayProductionItem
                                equipmentCount={props.equipment.count}
                                effectiveScale={effectiveScales()[index()]}
                                manualEfficiency={item.manualEfficiency}
                                efficiencyEditable={state.isEditingEfficiencies}
                                recipeId={item.recipeId}
                                onShareUpdate={(efficiency) => {
                                    updateState('factoryEquipment', index(), 'production', index(), {
                                        manualEfficiency: efficiency,
                                    });
                                }}
                            />
                        </ListItem>
                    );
                }}
            </For>
        </List>
    );
};
