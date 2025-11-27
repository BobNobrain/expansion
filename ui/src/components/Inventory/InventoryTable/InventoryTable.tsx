import { type Component, createMemo, createSignal, type ParentComponent, Show } from 'solid-js';
import { Container, DataTable, type DataTableColumn, InlineLoader, Text } from '@/atoms';
import { CommodityIcon } from '@/components/CommodityIcon';
import { renderGameTimeConstantSpeed } from '@/domain/GameTime';
import { useNow } from '@/lib/solid/useNow';
import { formatInteger, formatScalar } from '@/lib/strings';
import type { InventoryEntryWithData, InventoryEntry } from '../types';
import { getDeltaColor, useEnrichedEntries } from '../utils';
import styles from './InventoryTable.module.css';

export type InventoryTableProps = {
    loading?: boolean;
    entries: InventoryEntry[];
    display?: 'amounts' | 'speeds' | 'both';
};

const ItemCell: Component<{ row: InventoryEntryWithData }> = (props) => {
    const now = useNow('10s');

    const delta = createMemo(() => {
        if (props.row.speed === undefined) {
            return undefined;
        }

        return renderGameTimeConstantSpeed(props.row.speed, { quantized: props.row.quantized, noTimeUnit: true });
    });

    return (
        <div class={styles.itemCell}>
            <CommodityIcon
                commodity={props.row.commodity}
                size="md"
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
                <div class={styles.itemCellTitle}>{props.row.commodity}</div>
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
    const size = createMemo(() => {
        if (!props.row.speed) {
            return null;
        }

        const amount = props.row.speed;
        return {
            m: renderGameTimeConstantSpeed(amount * props.row.mass, { unit: 't' }),
            v: renderGameTimeConstantSpeed(amount * props.row.volume, { unit: 'm³' }),
        };
    });

    const deltaColor = createMemo(() => {
        const speed = props.row.speed;
        if (!speed) {
            return undefined;
        }

        return speed > 0 ? 'success' : 'error';
    });

    return (
        <Show
            when={!props.row.quantized || props.showQuantizedSize}
            fallback={
                <Show when={props.row.speed !== undefined} fallback={<Text>--</Text>}>
                    <Text color={deltaColor()}>
                        {renderGameTimeConstantSpeed(props.row.speed!, { quantized: true })}
                    </Text>
                </Show>
            }
        >
            <Show when={size()} fallback={<Text>--</Text>}>
                <Container direction="column" secondaryAlignment="end">
                    <Text size="small" color={deltaColor()}>
                        {size()!.m}
                    </Text>
                    <Text size="small" color={deltaColor()}>
                        {size()!.v}
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
        let displayAmounts = true;
        let displaySpeeds = false;

        switch (props.display) {
            case 'speeds':
                displaySpeeds = true;
                displayAmounts = false;
                break;

            case 'both':
                displaySpeeds = true;
                break;
        }

        const columns: DataTableColumn<InventoryEntryWithData>[] = [
            {
                header: { text: 'Item' },
                content: (row) => {
                    return <ItemCell row={row} />;
                },
            },
        ];

        if (displayAmounts) {
            columns.push({
                header: { text: 'Amount' },
                width: 90,
                align: 'right',
                onCellClick: onAmountCellClick,
                content: (row) => <AmountCell row={row} showQuantizedSize={getShowQuantizedSize()} />,
            });
        }

        if (displaySpeeds) {
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
        <DataTable columns={columns()} rows={rows()}>
            <Show when={props.loading} fallback={props.children ?? 'Storage is empty'}>
                <InlineLoader />
            </Show>
        </DataTable>
    );
};
