import { type Component } from 'solid-js';
import { Container } from '@/atoms';
import { DynamicInventory, Inventory, Storage } from '@/domain/Inventory';
import { StorageContent } from '../StorageContent/StorageContent';
import { useFormContext } from './state';
import { TransferSelector } from './TransferSelector';

export const InventoryTransferSelection: Component = () => {
    const { source, isLoading, updateState, selectedCommodityIds } = useFormContext();

    return (
        <Container padded>
            <TransferSelector />

            <StorageContent
                storage={source()}
                inset
                isLoading={isLoading()}
                selection={selectedCommodityIds()}
                onSelect={(cid) => {
                    const storage = source();

                    updateState(({ selection }) => {
                        if (!storage) {
                            return {};
                        }

                        if (selection[cid] !== undefined) {
                            const copy = { ...selection };
                            delete copy[cid];
                            return { selection: copy };
                        }

                        return {
                            selection: { ...selection, [cid]: Storage.getCommodityAmount(storage, cid, new Date()) },
                        };
                    });
                }}
                onSelectAll={() => {
                    const storage = source();
                    updateState(({ selection }) => {
                        if (!storage) {
                            return {};
                        }

                        const inventoryAsOfNow = Inventory.clone(storage.staticContent);
                        if (storage.dynamicContent) {
                            Inventory.addInto(
                                inventoryAsOfNow,
                                DynamicInventory.sample(storage.dynamicContent, new Date()),
                            );
                        }

                        if (
                            Inventory.getAllCommodities(selection).size ===
                            Inventory.getAllCommodities(inventoryAsOfNow).size
                        ) {
                            return { selection: Inventory.empty() };
                        }

                        return { selection: inventoryAsOfNow };
                    });
                }}
            />
        </Container>
    );
};
