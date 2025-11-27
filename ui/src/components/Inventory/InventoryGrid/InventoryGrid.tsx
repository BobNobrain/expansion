import { type Component, createMemo, createSignal, For, Show } from 'solid-js';
import { Text } from '@/atoms';
import { CommodityIcon } from '@/components/CommodityIcon';
import { renderGameTimeConstantSpeed, renderGameTimeSpeed } from '@/domain/GameTime';
import { useNow } from '@/lib/solid/useNow';
import { formatScalar } from '@/lib/strings';
import { type InventoryEntryWithData, type InventoryEntry } from '../types';
import { getDeltaColor, useEnrichedEntries } from '../utils';
import styles from './InventoryGrid.module.css';

export type InventoryGridProps = {
    loading?: boolean;
    entries: InventoryEntry[];
};

const InventoryGridItem: Component<{ item: InventoryEntryWithData; mode: 'M' | 'V'; toggleMode: () => void }> = (
    props,
) => {
    const now = useNow('10s');

    const amount = createMemo(() => props.item.amount?.predict(now()));

    const speed = createMemo(() => {
        if (props.item.speed !== undefined) {
            return renderGameTimeConstantSpeed(props.item.speed);
        }

        if (!props.item.amount) {
            return undefined;
        }

        return renderGameTimeSpeed(
            {
                predict: (at) =>
                    props.item.amount!.predict(at) * (props.mode === 'M' ? props.item.mass : props.item.volume),
            },
            now(),
            { unit: 't' },
        );
    });

    return (
        <div class={styles.item}>
            <div class={styles.itemTop}>
                <CommodityIcon commodity={props.item.commodity} />
                <div class={styles.mass} onClick={props.toggleMode}>
                    <Show when={amount() !== undefined}>
                        <Text color="bright">
                            {formatScalar(amount()! * (props.mode === 'M' ? props.item.mass : props.item.volume), {
                                digits: 1,
                                unit: 't',
                            })}
                        </Text>
                    </Show>
                    <Show when={speed() !== undefined}>
                        <Text color={getDeltaColor(speed()!)} size="small">
                            {speed()}
                        </Text>
                    </Show>
                </div>
            </div>
            <div class={styles.label}>
                <Text>{props.item.commodity}</Text>
                <Show when={props.item.quantized && amount() !== undefined}>
                    <Text class={styles.quantity} color="bright" size="large">
                        {amount()!.toFixed(0)}
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

    return (
        <div class={styles.grid}>
            <For each={items()}>
                {(item) => {
                    return <InventoryGridItem item={item} mode={getMode()} toggleMode={toggleMode} />;
                }}
            </For>
        </div>
    );
};
