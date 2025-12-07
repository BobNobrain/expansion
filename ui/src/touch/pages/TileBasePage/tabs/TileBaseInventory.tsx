import { createMemo, createSignal, Show, type Component } from 'solid-js';
import { Button, PageHeader, PageHeaderActions, PageHeaderIcon, PageHeaderTitle } from '@/atoms';
import { type InventoryEntry, InventoryTable, InventoryGrid } from '@/components/Inventory';
import { IconCalendar, IconContext, IconStorage, IconUnknown } from '@/icons';
import { createConstantPredictable } from '@/lib/predictables';
import { useBase } from '../hooks';

type DisplayMode = 'grid' | 'table';

export const TileBaseInventory: Component = () => {
    const base = useBase();

    const inventoryEntries = createMemo(() => {
        const inventory = base()?.inventory;
        if (!inventory) {
            return [];
        }

        return Object.entries(inventory).map(([cid, amount]): InventoryEntry => {
            return {
                commodity: cid,
                amount: createConstantPredictable(amount),
            };
        });
    });

    const [displayMode, setDisplayMode] = createSignal<DisplayMode>('grid');
    const setDisplayModeGrid = () => setDisplayMode('grid');
    const setDisplayModeTable = () => setDisplayMode('table');

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>Inventory</PageHeaderTitle>
                <PageHeaderIcon icon={IconStorage} text="35%" />
                <PageHeaderIcon icon={IconCalendar} text="14d" />
                <PageHeaderActions pushRight>
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
