import { createMemo, createSignal, For, type Component } from 'solid-js';
import { List, ListItem, ListItemContent } from '@/atoms';
import { Storage } from '@/domain/Inventory';
import { useModalRouteState } from '@/routes/modals';
import { TouchModal } from '@/touch/components/TouchModal';
import { Arrow } from '../RecipeDisplay/Arrow';
import { getStorageTypeDescription, getStorageTypeIcon, StorageCard } from '../StorageCard/StorageCard';
import { useFormContext } from './state';
import styles from './InventoryTransferForm.module.css';

export const TransferSelector: Component<{ editable?: boolean }> = (props) => {
    const { state, selectedSource, allStorages, isLoading, selectedCommodityIds, updateState } = useFormContext();

    const selectedTarget = createMemo(() => {
        for (const t of allStorages()) {
            if (t.id === state.selectedTargetId) {
                return t;
            }
        }

        return null;
    });

    const optionList = useModalRouteState('storageSelector');

    const [getCurrentlySelecting, setCurrentlySelecting] = createSignal<'source' | 'target' | undefined>('target');
    const currentlySelectedId = createMemo(() => {
        const mode = getCurrentlySelecting();
        switch (mode) {
            case 'source':
                return state.selectedSourceId;
            case 'target':
                return state.selectedTargetId;
        }
    });

    const pickOpposingId = (storageId: string, currentOpposingId: string | null): string | null => {
        const options = allStorages().map((s) => s.id);
        const storageType = Storage.getStorageTypeFromId(storageId);

        if (currentOpposingId !== null) {
            const currentOpposingType = Storage.getStorageTypeFromId(currentOpposingId);

            if (currentOpposingType !== storageType) {
                return currentOpposingId;
            }
        }

        return options.find((id) => Storage.getStorageTypeFromId(id) !== storageType) ?? null;
    };

    const onSelect = (storageId: string) => {
        if (!props.editable) {
            return;
        }

        const mode = getCurrentlySelecting();

        updateState(({ selectedSourceId, selectedTargetId }) => {
            let newSourceId = selectedSourceId;
            let newTargetId = selectedTargetId;

            switch (mode) {
                case 'source':
                    newSourceId = storageId;
                    newTargetId = pickOpposingId(storageId, selectedTargetId);
                    break;

                case 'target':
                    newTargetId = storageId;
                    newSourceId = pickOpposingId(storageId, selectedSourceId);
                    break;
            }

            return { selectedSourceId: newSourceId, selectedTargetId: newTargetId };
        });
    };

    return (
        <div class={styles.transferSelectors}>
            <StorageCard
                storage={selectedSource()}
                isLoading={isLoading()}
                fallbackName="Select Storage"
                selectable={props.editable}
                onClick={
                    props.editable
                        ? () => {
                              setCurrentlySelecting('source');
                              optionList.open();
                          }
                        : undefined
                }
            />
            <div class={styles.arrow}>
                <Arrow
                    animated={selectedSource() !== null && selectedTarget() !== null && selectedCommodityIds().size > 0}
                />
            </div>
            <StorageCard
                storage={selectedTarget()}
                isLoading={isLoading()}
                fallbackName="Select Storage"
                selectable={props.editable}
                onClick={
                    props.editable
                        ? () => {
                              setCurrentlySelecting('target');
                              optionList.open();
                          }
                        : undefined
                }
            />

            <TouchModal isOpen={optionList.isOpen()} onClose={optionList.close} title="Target Storage" noPadding>
                <List striped>
                    <For each={allStorages()}>
                        {(storage) => {
                            return (
                                <ListItem
                                    selected={storage.id === currentlySelectedId()}
                                    onClick={() => {
                                        onSelect(storage.id);
                                        optionList.close();
                                    }}
                                >
                                    <ListItemContent
                                        title={storage.name}
                                        subtitle={getStorageTypeDescription(storage.type)}
                                        icon={getStorageTypeIcon(storage.type)}
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
