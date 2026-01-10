import { createMemo, createSignal, Show, type Component, type JSX } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { PageHeader, PageHeaderTitle, PageHeaderIcon, PageHeaderActions, Button } from '@/atoms';
import { Storage } from '@/domain/Inventory';
import { IconStorage, IconCalendar, IconGrid, IconTable, IconTransfer, IconTick } from '@/icons';
import { commoditiesAsset } from '@/lib/assetmanager';
import { createConstantPredictable } from '@/lib/predictables';
import { useAsset } from '@/lib/solid/asset';
import { emulateLinkClick } from '@/lib/solid/emulateLinkClick';
import { useNow } from '@/lib/solid/useNow';
import { formatPercentage } from '@/lib/strings';
import { inventoryTransferRoute } from '@/routes/transfer';
import { type InventoryEntry, InventoryGrid, InventoryTable } from '../Inventory';

type DisplayMode = 'grid' | 'table';

export type StorageContentProps = {
    title?: JSX.Element;
    storage: Storage | null;
    isLoading?: boolean;

    allowTransfer?: boolean;
    showStats?: boolean;
    inset?: boolean;

    selection?: Set<string>;
    onSelect?: (cid: string) => void;
    onSelectAll?: () => void;
};

export const StorageContent: Component<StorageContentProps> = (props) => {
    const inventoryEntries = createMemo(() => {
        const storage = props.storage;
        if (!storage) {
            return [];
        }

        const staticEntries = Object.entries(storage.staticContent).map(([cid, amount]): InventoryEntry => {
            return {
                commodity: cid,
                amount: createConstantPredictable(amount),
            };
        });

        if (!storage.dynamicContent) {
            return staticEntries;
        }

        const dynamicEntries = Object.entries(storage.dynamicContent).map(([cid, amount]): InventoryEntry => {
            return {
                commodity: cid,
                amount,
            };
        });

        return staticEntries.concat(dynamicEntries);
    });

    const [displayMode, setDisplayMode] = createSignal<DisplayMode>('grid');
    const setDisplayModeGrid = () => setDisplayMode('grid');
    const setDisplayModeTable = () => setDisplayMode('table');

    const now = useNow('10s');
    const commodities = useAsset(commoditiesAsset);

    const filledPercentage = createMemo(() => {
        const commoditiesData = commodities();
        if (!props.storage || !commoditiesData) {
            return '--';
        }

        const percentage = Storage.measureFilledPercentage(props.storage, now(), commoditiesData);
        return formatPercentage(percentage, { digits: 1 });
    });

    const navigate = useNavigate();

    return (
        <>
            <PageHeader>
                <PageHeaderTitle>{props.title ?? props.storage?.name ?? 'Inventory'}</PageHeaderTitle>
                <Show when={props.showStats}>
                    <PageHeaderIcon
                        icon={IconStorage}
                        text={filledPercentage()}
                        isTextLoading={props.isLoading || commodities() === null}
                    />
                    <PageHeaderIcon
                        icon={IconCalendar}
                        text="14d"
                        isTextLoading={props.isLoading || commodities() === null}
                    />
                </Show>
                <PageHeaderActions pushRight>
                    <Show when={props.onSelectAll}>
                        <Button
                            square
                            style="light"
                            color={inventoryEntries().length === props.selection?.size ? 'primary' : undefined}
                            onClick={props.onSelectAll}
                        >
                            <IconTick size={32} block />
                        </Button>
                    </Show>
                    <Button
                        square
                        style="light"
                        color={displayMode() === 'grid' ? 'primary' : undefined}
                        onClick={setDisplayModeGrid}
                    >
                        <IconGrid size={32} block />
                    </Button>
                    <Button
                        square
                        style="light"
                        color={displayMode() === 'table' ? 'primary' : undefined}
                        onClick={setDisplayModeTable}
                    >
                        <IconTable size={32} block />
                    </Button>
                    <Show when={props.allowTransfer}>
                        <Button
                            square
                            style="light"
                            disabled={props.storage === null}
                            loading={props.isLoading}
                            onClick={(ev) => {
                                if (!props.storage) {
                                    return;
                                }

                                emulateLinkClick(
                                    { navigate, href: inventoryTransferRoute.render({ sourceId: props.storage.id }) },
                                    ev,
                                );
                            }}
                        >
                            <IconTransfer size={32} block />
                        </Button>
                    </Show>
                </PageHeaderActions>
            </PageHeader>
            <Show when={displayMode() === 'grid'}>
                <InventoryGrid
                    entries={inventoryEntries()}
                    loading={props.isLoading}
                    inset={props.inset}
                    display={props.storage?.dynamicContent ? 'both' : 'amounts'}
                    selectedEntries={props.selection}
                    onEntryClick={(entry) => props.onSelect?.(entry.commodity)}
                />
            </Show>
            <Show when={displayMode() === 'table'}>
                <InventoryTable
                    entries={inventoryEntries()}
                    loading={props.isLoading}
                    inset={props.inset}
                    display={props.storage?.dynamicContent ? 'both' : 'amounts'}
                    selectedEntries={props.selection}
                    onEntryClick={(entry) => props.onSelect?.(entry.commodity)}
                />
            </Show>
        </>
    );
};
