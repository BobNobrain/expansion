import { createMemo, createSignal, For, Show, type Component } from 'solid-js';
import { InfoDisplay, List, ListItem, Spacer } from '@/atoms';
import type { ContributionHistoryItem } from '@/domain/Contribution';
import type { Inventory } from '@/domain/Inventory';
import { createConstantPredictable } from '@/lib/predictables';
import { UserLink } from '@/views/UserLink/UserLink';
import { GameTimeLabel } from '../GameTimeLabel/GameTimeLabel';
import { InventoryTable, type InventoryEntry } from '../Inventory';
import styles from './ContributionHistory.module.css';
import { IconChevronRight } from '@/icons';

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
        <ListItem onClick={() => setExpanded((x) => !x)} padded={false}>
            <div class={styles.itemTitle}>
                <GameTimeLabel value={props.date} />, by&nbsp;
                <UserLink id={props.author} />
                <Spacer />
                <IconChevronRight size={24} rotate={isExpanded() ? 90 : 0} />
            </div>
            <Show when={isExpanded()}>
                <div class={styles.tableContainer}>
                    <InventoryTable entries={inventoryEntries()} />
                </div>
            </Show>
        </ListItem>
    );
};

export type ContributionHistoryProps = {
    history: ContributionHistoryItem[];
};

export const ContributionHistory: Component<ContributionHistoryProps> = (props) => {
    const sortedHistory = createMemo(() => {
        const sorted = props.history.slice();
        sorted.sort((a, b) => b.date.getTime() - a.date.getTime());
        return sorted;
    });

    return (
        <List striped>
            <For
                each={sortedHistory()}
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
