import { createMemo, createSignal, Show, type Component } from 'solid-js';
import { Button } from '../../../../components/Button/Button';
import { Spacer } from '../../../../components/Container/Container';
import { type InventoryEntry, InventoryTable, InventoryGrid } from '../../../../components/Inventory';
import { PageHeader, PageHeaderActions, PageHeaderIcon, PageHeaderTitle } from '../../../../components/PageHeader';
import { IconCalendar, IconContext, IconStorage, IconUnknown } from '../../../../icons';
import { createConstantPredictable, createLinearPredictable } from '../../../../lib/predictables';

const t0 = new Date();
type DisplayMode = 'grid' | 'table';

export const TileBaseInventory: Component = () => {
    const inventoryEntries = createMemo<InventoryEntry[]>(() => [
        {
            commodity: 'limestone',
            amount: createLinearPredictable({ t0, x0: 25, deltaT: 1000, deltaX: 0.001 }),
        },
        {
            commodity: 'coal',
            amount: createLinearPredictable({ t0, x0: 25, deltaT: 1000, deltaX: 0.002 }),
        },
        {
            commodity: 'ironOre',
            amount: createLinearPredictable({ t0, x0: 25, deltaT: 1000, deltaX: 0.0015 }),
        },
        {
            commodity: 'steel',
            amount: createLinearPredictable({ t0, x0: 25, deltaT: 1000, deltaX: 0.01 }),
        },
        {
            commodity: 'oxygen',
            amount: createLinearPredictable({ t0, x0: 25, deltaT: 1000, deltaX: -0.003 }),
        },
        {
            commodity: 'steelBeams',
            amount: createConstantPredictable(58),
        },
    ]);

    const [displayMode, setDisplayMode] = createSignal<DisplayMode>('grid');
    const setDisplayModeGrid = () => setDisplayMode('grid');
    const setDisplayModeTable = () => setDisplayMode('table');

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>Inventory</PageHeaderTitle>
                <PageHeaderIcon icon={IconStorage} text="35%" />
                <PageHeaderIcon icon={IconCalendar} text="14d" />
                <Spacer />
                <PageHeaderActions>
                    <Button
                        square
                        style="light"
                        color={displayMode() === 'grid' ? 'primary' : undefined}
                        onClick={setDisplayModeGrid}
                    >
                        <IconContext size={32} block />
                    </Button>
                    <Button
                        square
                        style="light"
                        color={displayMode() === 'table' ? 'primary' : undefined}
                        onClick={setDisplayModeTable}
                    >
                        <IconUnknown size={32} block />
                    </Button>
                    <Button square style="light">
                        <IconUnknown size={32} block />
                    </Button>
                </PageHeaderActions>
            </PageHeader>
            <Show when={displayMode() === 'grid'}>
                <InventoryGrid entries={inventoryEntries()} />
            </Show>
            <Show when={displayMode() === 'table'}>
                <InventoryTable entries={inventoryEntries()} />
            </Show>
        </>
    );
};
