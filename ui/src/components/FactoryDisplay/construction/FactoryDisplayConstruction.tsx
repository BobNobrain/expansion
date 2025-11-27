import { createMemo, type Component } from 'solid-js';
import { useFactoryDisplayContext } from '../state';
import { Factory } from '@/domain/Base';
import { useAsset } from '@/lib/solid/asset';
import { buildingsAsset } from '@/lib/assetmanager';
import { ConstructionCost } from '@/domain/Commodity';
import { InventoryTable, type InventoryEntry } from '@/components/Inventory';
import { InfoDisplay, PageHeader, PageHeaderTitle } from '@/atoms';
import { createConstantPredictable } from '@/lib/predictables';

export const FactoryDisplayConstruction: Component = () => {
    const { state } = useFactoryDisplayContext();
    const buildings = useAsset(buildingsAsset);

    const constructionCosts = createMemo(() => {
        const buildingsData = buildings();
        if (!buildingsData) {
            return ConstructionCost.empty();
        }

        return Factory.getConstructionCost(buildingsData, { equipment: state.factoryEquipment });
    });

    const inventoryEntries = createMemo((): InventoryEntry[] => {
        const costs = constructionCosts();

        return Object.entries(costs).map(([cid, amount]): InventoryEntry => {
            return {
                commodity: cid,
                amount: createConstantPredictable(amount),
            };
        });
    });

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>Construction Costs</PageHeaderTitle>
            </PageHeader>
            <InventoryTable entries={inventoryEntries()} loading={buildings() === null}>
                <InfoDisplay title="Nothing to construct yet">
                    You need to add equipment to this factory to be able to construct it.
                </InfoDisplay>
            </InventoryTable>
        </>
    );
};
