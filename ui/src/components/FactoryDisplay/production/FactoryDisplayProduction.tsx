import { createMemo, type Component } from 'solid-js';
import { Button, InfoDisplay, PageHeader, PageHeaderActions, PageHeaderTitle } from '@/atoms';
import { InventoryTable } from '@/components/Inventory';
import { Factory } from '@/domain/Base';
import type { Recipe } from '@/domain/Recipe';
import type { Inventory } from '@/domain/Inventory';
import { IconCog, IconHandbook } from '@/icons';
import { useRecipesList } from '../hooks';
import { useFactoryDisplayContext } from '../state';
import { StorageTotals } from './StorageTotals';

export const FactoryDisplayProduction: Component = () => {
    const { state } = useFactoryDisplayContext();
    const recipes = useRecipesList();

    const totalInOuts = createMemo((): Inventory => {
        const recipesHashed: Record<string, Recipe> = {};
        for (const recipe of recipes()) {
            recipesHashed[recipe.id] = recipe;
        }

        const equipment = state.factoryEquipment;
        const total = Factory.getTotalInOuts(recipesHashed, { equipment });

        return total;
    });

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>Production</PageHeaderTitle>
                <PageHeaderActions pushRight>
                    <Button style="light" square>
                        <IconHandbook size={32} />
                    </Button>
                </PageHeaderActions>
            </PageHeader>
            <InventoryTable
                entries={Object.entries(totalInOuts()).map(([cid, amt]) => {
                    return {
                        commodity: cid,
                        speed: amt,
                    };
                })}
                display="speeds"
            >
                <InfoDisplay title="Nothing to show">
                    This factory produces and consumes nothing. Add some equipment and recipes for it to become useful.
                </InfoDisplay>
            </InventoryTable>
            <PageHeader>
                <PageHeaderTitle>Storage</PageHeaderTitle>
                <PageHeaderActions pushRight>
                    <Button style="light" square>
                        <IconCog size={32} />
                    </Button>
                </PageHeaderActions>
            </PageHeader>
            <StorageTotals
                totals={totalInOuts()}
                capacity={{
                    mass: 5000,
                    volume: 5000,
                }}
            />
        </>
    );
};
