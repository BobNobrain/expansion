import { createStore } from 'solid-js/store';
import { type Factory, type FactoryEquipment, type FactoryProduction } from '@/domain/Base';
import { WorkforceData } from '@/domain/City';

export type CreateFactoryFormState = {
    factory: () => Factory;
    updateEquipmentCounts: (counts: Record<string, number>) => void;
    updateProduction: (index: number, items: FactoryProduction[]) => void;
    updateProductionEfficiency: (index: number, recipeId: number, value: number) => void;
};

export function useCreateFactoryFormState(): CreateFactoryFormState {
    const [factory, updateFactory] = createStore<Factory>({
        id: -1,
        equipment: [],
    });

    return {
        factory: () => factory,

        updateEquipmentCounts: (counts) => {
            updateFactory('equipment', (eqs): FactoryEquipment[] => {
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
        },

        updateProduction: (index, items) => {
            if (index < 0 || factory.equipment.length <= index) {
                return;
            }

            updateFactory('equipment', index, (eq) => {
                const result: Record<string, FactoryProduction> = {};

                for (const item of items) {
                    result[item.recipeId] = item;
                }

                return {
                    ...eq,
                    production: result,
                };
            });
        },

        updateProductionEfficiency: (index, rid, value) => {
            updateFactory('equipment', index, 'production', String(rid), { manualEfficiency: value });
        },
    };
}
