import { type Component, createMemo, createSignal, type ParentComponent, Show } from 'solid-js';
import { Container, DataTable, type DataTableColumn, InlineLoader, Text } from '@/atoms';
import { CommodityIcon } from '@/components/CommodityIcon';
import { Inventory } from '@/domain/Inventory';
import { useNow } from '@/lib/solid/useNow';
import { formatInteger, formatScalar } from '@/lib/strings';
import { renderConstantSpeed } from '@/lib/time';
import type { InventoryEntryWithData, InventoryEntry, InventoryDisplayMode } from '../types';
import { getDeltaColor, getDisplaySettings, useEnrichedEntries } from '../utils';
import styles from './InventoryTable.module.css';
import { renderPredictableSpeed } from '@/lib/predictables';

export type InventoryTableProps = {
    loading?: boolean;
    entries: InventoryEntry[];
    display?: InventoryDisplayMode;
    inset?: boolean;
    selectedEntries?: Set<string>;
    onEntryClick?: (entry: InventoryEntry) => void;
};

const ItemCell: Component<{ row: InventoryEntryWithData; checked: boolean }> = (props) => {
    const now = useNow('10s');

    const delta = createMemo(() => {
        if (props.row.speed === undefined) {
            return undefined;
        }

        return renderConstantSpeed(props.row.speed, { h: 1 }, { noTimeUnit: true });
    });

    return (
        <div class={styles.itemCell}>
            <CommodityIcon
                commodity={props.row.commodity}
                size="md"
                checked={props.checked}
                badge={
                    <Show when={props.row.quantized}>
                        <Show
                            when={props.row.amount}
                            fallback={
                                <Show when={delta()}>
                                    <Text color={getDeltaColor(delta()!)} size="small">
                                        {delta()}
                                    </Text>
                                </Show>
                            }
                        >
                            <Text size="small">{props.row.amount!.predict(now()).toFixed(0)}</Text>
                        </Show>
                    </Show>
                }
            />
            <div class={styles.itemCellLabels}>
                <Text tag="div" color={props.checked ? 'primary' : undefined} class={styles.itemCellTitle}>
                    {props.row.commodity}
                </Text>
            </div>
        </div>
    );
};

const AmountCell: Component<{ row: InventoryEntryWithData; showQuantizedSize: boolean }> = (props) => {
    const now = useNow('10s');
    const size = createMemo(() => {
        if (!props.row.amount) {
            return null;
        }

        const amount = props.row.amount.predict(now());
        return {
            m: formatScalar(amount * props.row.mass, { digits: 1, unit: 't' }),
            v: formatScalar(amount * props.row.volume, { digits: 1, unit: 'm³' }),
        };
    });

    return (
        <Show
            when={!props.row.quantized || props.showQuantizedSize}
            fallback={
                <Show when={props.row.amount} fallback={<Text>--</Text>}>
                    <Text color="bright">{formatInteger(props.row.amount!.predict(now()))}</Text>
                </Show>
            }
        >
            <Show when={size()} fallback={<Text>--</Text>}>
                <Container direction="column" secondaryAlignment="end">
                    <Text color="bright">{size()!.m}</Text>
                    <Text size="small">{size()!.v}</Text>
                </Container>
            </Show>
        </Show>
    );
};

const SpeedCell: Component<{ row: InventoryEntryWithData; showQuantizedSize: boolean }> = (props) => {
    const now = useNow('10s');

    const speed = createMemo(() => {
        if (props.row.speed !== undefined) {
            const amount = props.row.speed;
            return {
                m: renderConstantSpeed(amount * props.row.mass, Inventory.STANDARD_TIME_DELTA, { unit: 't' }),
                v: renderConstantSpeed(amount * props.row.volume, Inventory.STANDARD_TIME_DELTA, { unit: 'm³' }),
            };
        }

        if (!props.row.amount) {
            return null;
        }

        return {
            m: renderPredictableSpeed(props.row.amount, now(), { unit: 't', multiplier: props.row.mass }),
            v: renderPredictableSpeed(props.row.amount, now(), { unit: 'm³', multiplier: props.row.volume }),
        };
    });

    const deltaColor = createMemo(() => {
        const delta = speed()?.m;
        if (!delta) {
            return undefined;
        }

        return getDeltaColor(delta);
    });

    return (
        <Show
            when={!props.row.quantized || props.showQuantizedSize}
            fallback={
                <Show when={props.row.speed !== undefined} fallback={<Text>--</Text>}>
                    <Text color={deltaColor()}>
                        {renderConstantSpeed(props.row.speed!, Inventory.STANDARD_TIME_DELTA)}
                    </Text>
                </Show>
            }
        >
            <Show when={speed()} fallback={<Text>--</Text>}>
                <Container direction="column" secondaryAlignment="end">
                    <Text size="small" color={deltaColor()}>
                        {speed()!.m}
                    </Text>
                    <Text size="small" color={deltaColor()}>
                        {speed()!.v}
                    </Text>
                </Container>
            </Show>
        </Show>
    );
};

export const InventoryTable: ParentComponent<InventoryTableProps> = (props) => {
    const [getShowQuantizedSize, setShowQuantizedSize] = createSignal(false);

    const onAmountCellClick = (row: InventoryEntryWithData) => {
        if (row.quantized) {
            setShowQuantizedSize((x) => !x);
        }
    };

    const columns = createMemo(() => {
        const display = getDisplaySettings(props.display);

        const columns: DataTableColumn<InventoryEntryWithData>[] = [
            {
                header: { text: 'Item' },
                content: (row) => {
                    return <ItemCell row={row} checked={props.selectedEntries?.has(row.commodity) ?? false} />;
                },
            },
        ];

        if (display.amounts) {
            columns.push({
                header: { text: 'Amount' },
                width: 90,
                align: 'right',
                onCellClick: onAmountCellClick,
                content: (row) => <AmountCell row={row} showQuantizedSize={getShowQuantizedSize()} />,
            });
        }

        if (display.speeds) {
            columns.push({
                header: { text: 'Rate' },
                width: 90,
                align: 'right',
                onCellClick: onAmountCellClick,
                content: (row) => <SpeedCell row={row} showQuantizedSize={getShowQuantizedSize()} />,
            });
        }

        return columns;
    });

    const rows = useEnrichedEntries(() => props.entries);

    return (
        <DataTable
            columns={columns()}
            rows={rows()}
            inset={props.inset}
            onRowClick={(row) => {
                props.onEntryClick?.(row);
            }}
        >
            <Show when={props.loading} fallback={props.children ?? 'Storage is empty'}>
                <InlineLoader />
            </Show>
        </DataTable>
    );
};
