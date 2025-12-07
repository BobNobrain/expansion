import { type Component } from 'solid-js';
import { Button, PageHeader, PageHeaderActions, PageHeaderTitle } from '@/atoms';
import { IconCog, IconHandbook } from '@/icons';
import { ProductionTotals } from './ProductionTotals';
import { StorageTotals } from './StorageTotals';
import { useTotalInOuts } from './useTotalInOuts';

export const FactoryDisplayProduction: Component = () => {
    const totalInOuts = useTotalInOuts();

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
            <ProductionTotals speeds={totalInOuts()} />
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
