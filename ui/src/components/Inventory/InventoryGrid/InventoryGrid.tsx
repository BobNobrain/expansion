import { type Component, createMemo, createSignal, For, Show } from 'solid-js';
import { Text } from '@/atoms';
import { CommodityIcon } from '@/components/CommodityIcon';
import { Inventory } from '@/domain/Inventory';
import { renderPredictableSpeed } from '@/lib/predictables';
import { useNow } from '@/lib/solid/useNow';
import { formatInteger, formatScalar } from '@/lib/strings';
import { renderConstantSpeed } from '@/lib/time';
import { type InventoryEntryWithData, type InventoryEntry, type InventoryDisplayMode } from '../types';
import { getDeltaColor, getDisplaySettings, useEnrichedEntries } from '../utils';
import styles from './InventoryGrid.module.css';

export type InventoryGridProps = {
    loading?: boolean;
    inset?: boolean;
    entries: InventoryEntry[];
    display?: InventoryDisplayMode;

    selectedEntries?: Set<string>;
    onEntryClick?: (entry: InventoryEntry) => void;
};

const InventoryGridItem: Component<{
    item: InventoryEntryWithData;
    mode: 'M' | 'V';
    displaySpeed?: boolean;
    displayAmount?: boolean;
    toggleMode: () => void;
    isSelected: boolean;
    onClick?: (item: InventoryEntry) => void;
}> = (props) => {
    const now = useNow('10s');

    const amount = createMemo(() => {
        if (!props.item.amount) {
            return '--';
        }

        const value = props.item.amount.predict(now());
        return formatScalar(value * (props.mode === 'M' ? props.item.mass : props.item.volume), {
            digits: 1,
            unit: props.mode === 'M' ? 't' : 'm³',
        });
    });

    const count = createMemo(() => {
        if (!props.item.amount) {
            return '--';
        }

        return formatInteger(props.item.amount.predict(now()));
    });

    const speed = createMemo(() => {
        if (props.item.speed !== undefined) {
            return renderConstantSpeed(props.item.speed, Inventory.STANDARD_TIME_DELTA);
        }

        if (!props.item.amount) {
            return '--';
        }

        return renderPredictableSpeed(
            {
                predict: (at) =>
                    props.item.amount!.predict(at) * (props.mode === 'M' ? props.item.mass : props.item.volume),
            },
            now(),
            { unit: props.mode === 'M' ? 't' : 'm³' },
        );
    });

    return (
        <div
            class={styles.item}
            classList={{
                [styles.selected]: props.isSelected,
            }}
            onClick={() => props.onClick?.(props.item)}
        >
            <div class={styles.itemTop}>
                <CommodityIcon commodity={props.item.commodity} checked={props.isSelected} />
                <div class={styles.mass} onClick={props.onClick ? undefined : props.toggleMode}>
                    <Show when={props.displayAmount}>
                        <Text
                            color={props.item.quantized ? undefined : 'bright'}
                            size={props.displaySpeed ? undefined : 'large'}
                        >
                            {amount()}
                        </Text>
                    </Show>
                    <Show when={props.displaySpeed}>
                        <Text color={getDeltaColor(speed()!)} size={props.displayAmount ? 'small' : undefined}>
                            {speed()}
                        </Text>
                    </Show>
                </div>
            </div>
            <div class={styles.label}>
                <Text>{props.item.commodity}</Text>
                <Show when={props.item.quantized && props.displayAmount}>
                    <Text class={styles.quantity} color="bright" size="large">
                        {count()}
                    </Text>
                </Show>
            </div>
        </div>
    );
};

export const InventoryGrid: Component<InventoryGridProps> = (props) => {
    const items = useEnrichedEntries(() => props.entries);
    const [getMode, setMode] = createSignal<'M' | 'V'>('M');
    const toggleMode = () => setMode((old) => (old === 'M' ? 'V' : 'M'));

    const displaySettings = createMemo(() => getDisplaySettings(props.display));

    return (
        <div
            class={styles.grid}
            classList={{
                [styles.inset]: props.inset,
            }}
        >
            <For each={items()}>
                {(item) => {
                    const display = displaySettings();

                    return (
                        <InventoryGridItem
                            item={item}
                            isSelected={props.selectedEntries?.has(item.commodity) ?? false}
                            mode={getMode()}
                            toggleMode={toggleMode}
                            onClick={props.onEntryClick}
                            displayAmount={display.amounts}
                            displaySpeed={display.speeds}
                        />
                    );
                }}
            </For>
        </div>
    );
};
