import { type Component, createMemo, Show } from 'solid-js';
import { Container, DataTable, type DataTableColumn, InlineLoader, Text } from '@/atoms';
import { CommodityIcon } from '@/components/CommodityIcon';
import { renderGameTimeSpeed } from '@/domain/GameTime';
import { useNow } from '@/lib/solid/useNow';
import { formatScalar } from '@/lib/strings';
import type { InventoryEntryWithData, InventoryEntry } from '../types';
import { enrichWithCommodityData, getDeltaColor } from '../utils';
import styles from './InventoryTable.module.css';

export type InventoryTableProps = {
    loading?: boolean;
    entries: InventoryEntry[];
};

const ItemCell: Component<{ row: InventoryEntryWithData }> = (props) => {
    const now = useNow('10s');

    return (
        <div class={styles.itemCell}>
            <CommodityIcon commodity={props.row.commodity} />
            <div class={styles.itemCellLabels}>
                <div class={styles.itemCellTitle}>{props.row.commodity}</div>
                <Show when={props.row.quantized}>
                    <div class={styles.itemCellAmount}>{props.row.amount.predict(now()).toFixed(0)}</div>
                </Show>
            </div>
        </div>
    );
};

const AmountCell: Component<{ row: InventoryEntryWithData; unit: string; useDensity?: boolean }> = (props) => {
    const now = useNow('10s');

    const delta = createMemo(() =>
        renderGameTimeSpeed(
            props.useDensity
                ? {
                      predict: (at) => props.row.amount.predict(at) * props.row.density,
                  }
                : props.row.amount,
            now(),
            { unit: props.unit },
        ),
    );

    return (
        <Container direction="column" secondaryAlignment="end">
            <Text color={props.row.quantized ? undefined : 'bright'}>
                {formatScalar(props.row.amount.predict(now()) * props.row.density, { digits: 1, unit: props.unit })}
            </Text>
            <Text size="small" color={getDeltaColor(delta())}>
                {delta()}
            </Text>
        </Container>
    );
};

export const InventoryTable: Component<InventoryTableProps> = (props) => {
    const columns: DataTableColumn<InventoryEntryWithData>[] = [
        {
            header: { text: 'Item' },
            content: (row) => {
                return <ItemCell row={row} />;
            },
        },
        {
            header: { text: 'Weight' },
            width: 90,
            align: 'right',
            content: (row) => {
                return <AmountCell row={row} unit="t" useDensity />;
            },
        },
        {
            header: { text: 'Volume' },
            width: 90,
            align: 'right',
            content: (row) => {
                return <AmountCell row={row} unit="m³" />;
            },
        },
    ];

    const rows = createMemo(() => {
        return props.entries.map(enrichWithCommodityData);
    });

    return (
        <DataTable columns={columns} rows={rows()}>
            <Show when={props.loading} fallback="Storage is empty">
                <InlineLoader />
            </Show>
        </DataTable>
    );
};
