import { createMemo, createSignal, For, Show, type Component } from 'solid-js';
import { InfoDisplay, List, ListItem, Text } from '@/atoms';
import type { ContributionHistoryItem } from '@/domain/Contribution';
import type { Inventory } from '@/domain/Inventory';
import { createConstantPredictable } from '@/lib/predictables';
import { GameTimeLabel } from '../GameTimeLabel/GameTimeLabel';
import { InventoryTable, type InventoryEntry } from '../Inventory';
import styles from './ContributionHistory.module.css';

const Item: Component<{
    author: string;
    date: Date;
    items: Inventory;
}> = (props) => {
    const [isExpanded, setExpanded] = createSignal(false);
    const inventoryEntries = createMemo((): InventoryEntry[] => {
        return Object.entries(props.items).map(([cid, amount]) => {
            return {
                commodity: cid,
                amount: createConstantPredictable(amount),
            };
        });
    });

    return (
        <ListItem selected={isExpanded()} onClick={() => setExpanded((x) => !x)}>
            <div class={styles.itemTitle}>
                <Text bold>{props.author}</Text>
                <GameTimeLabel value={props.date} />
            </div>
            <Show when={isExpanded()}>
                <InventoryTable entries={inventoryEntries()} />
            </Show>
        </ListItem>
    );
};

export type ContributionHistoryProps = {
    history: ContributionHistoryItem[];
};

export const ContributionHistory: Component<ContributionHistoryProps> = (props) => {
    return (
        <List striped>
            <For
                each={props.history}
                fallback={
                    <ListItem>
                        <InfoDisplay title="No contributions yet">
                            No materials have been contributed so far.
                        </InfoDisplay>
                    </ListItem>
                }
            >
                {(item) => {
                    return <Item author={item.contributor} date={item.date} items={item.amounts} />;
                }}
            </For>
        </List>
    );
};
