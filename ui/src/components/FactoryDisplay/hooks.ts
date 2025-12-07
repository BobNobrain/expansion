import { createMemo } from 'solid-js';
import { useFactoryDisplayContext } from './state';
import type { FactoryEquipmentPlan } from '@/domain/Base';

export function useSelectedEquipment(): () => FactoryEquipmentPlan | null {
    const { state } = useFactoryDisplayContext();

    return createMemo((): FactoryEquipmentPlan | null => {
        if (
            state.equipmentIndexForRecipeSelector < 0 ||
            state.equipmentIndexForRecipeSelector >= state.factoryEquipment.length
        ) {
            return null;
        }
        return state.factoryEquipment[state.equipmentIndexForRecipeSelector];
    });
}
