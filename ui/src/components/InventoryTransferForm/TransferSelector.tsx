import { createMemo, For, type Component } from 'solid-js';
import { List, ListItem, ListItemContent } from '@/atoms';
import { useModalRouteState } from '@/routes/modals';
import { TouchModal } from '@/touch/components/TouchModal';
import { Arrow } from '../RecipeDisplay/Arrow';
import { getStorageTypeDescription, getStorageTypeIcon, StorageCard } from '../StorageCard/StorageCard';
import { useFormContext } from './state';
import styles from './InventoryTransferForm.module.css';

export const TransferSelector: Component = () => {
    const { state, source, targets, isLoading, selectedCommodityIds, updateState } = useFormContext();

    const selectedTarget = createMemo(() => {
        for (const t of targets()) {
            if (t.id === state.selectedTargetId) {
                return t;
            }
        }

        return null;
    });

    const optionList = useModalRouteState('targetStorage');

    return (
        <div class={styles.transferSelectors}>
            <StorageCard storage={source()} isLoading={isLoading()} />
            <div class={styles.arrow}>
                <Arrow animated={source() !== null && selectedTarget() !== null && selectedCommodityIds().size > 0} />
            </div>
            <StorageCard
                storage={selectedTarget()}
                isLoading={isLoading()}
                fallbackName="Select Storage"
                selectable
                onClick={() => optionList.open()}
            />

            <TouchModal isOpen={optionList.isOpen()} onClose={optionList.close} title="Target Storage" noPadding>
                <List striped>
                    <For each={targets()}>
                        {(target) => {
                            return (
                                <ListItem
                                    selected={target.id === state.selectedTargetId}
                                    onClick={() => {
                                        updateState('selectedTargetId', target.id);
                                        optionList.close();
                                    }}
                                >
                                    <ListItemContent
                                        title={target.name}
                                        subtitle={getStorageTypeDescription(target.type)}
                                        icon={getStorageTypeIcon(target.type)}
                                    />
                                </ListItem>
                            );
                        }}
                    </For>
                </List>
            </TouchModal>
        </div>
    );
};
