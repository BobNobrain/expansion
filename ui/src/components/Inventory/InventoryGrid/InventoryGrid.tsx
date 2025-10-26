import { type Component, createMemo, createSignal, For, Show } from 'solid-js';
import { Text } from '@/atoms';
import { CommodityIcon } from '@/components/CommodityIcon';
import { renderGameTimeSpeed } from '@/domain/GameTime';
import { useNow } from '@/lib/solid/useNow';
import { formatScalar } from '@/lib/strings';
import { type InventoryEntryWithData, type InventoryEntry } from '../types';
import { enrichWithCommodityData, getDeltaColor } from '../utils';
import styles from './InventoryGrid.module.css';

export type InventoryGridProps = {
    loading?: boolean;
    entries: InventoryEntry[];
};

const InventoryGridItem: Component<{ item: InventoryEntryWithData; mode: 'M' | 'V'; toggleMode: () => void }> = (
    props,
) => {
    const now = useNow('10s');

    const amount = createMemo(() => props.item.amount.predict(now()));

    const speed = createMemo(() =>
        renderGameTimeSpeed(
            props.mode === 'M'
                ? {
                      predict: (at) => props.item.amount.predict(at) * props.item.density,
                  }
                : props.item.amount,
            now(),
            { unit: 't' },
        ),
    );

    return (
        <div class={styles.item}>
            <div class={styles.itemTop}>
                <CommodityIcon commodity={props.item.commodity} />
                <div class={styles.mass} onClick={props.toggleMode}>
                    <Text color="bright">
                        {formatScalar(props.mode === 'M' ? amount() * props.item.density : amount(), {
                            digits: 1,
                            unit: 't',
                        })}
                    </Text>
                    <Text color={getDeltaColor(speed())} size="small">
                        {speed()}
                    </Text>
                </div>
            </div>
            <div class={styles.label}>
                <Text>{props.item.commodity}</Text>
                <Show when={props.item.quantized}>
                    <Text class={styles.quantity} color="bright" size="large">
                        {amount().toFixed(0)}
                    </Text>
                </Show>
            </div>
        </div>
    );
};

export const InventoryGrid: Component<InventoryGridProps> = (props) => {
    const items = createMemo(() => props.entries.map(enrichWithCommodityData));
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
