import { createMemo, type Component } from 'solid-js';
import { useBase } from '../hooks';
import { StorageContent } from '@/components/StorageContent/StorageContent';
import { Storage } from '@/domain/Inventory';

export const TileBaseInventory: Component = () => {
    const { base, isLoading } = useBase();

    const storage = createMemo(() => {
        const b = base();
        if (!b) {
            return null;
        }

        return Storage.fromBaseContent(b);
    });

    return <StorageContent storage={storage()} isLoading={isLoading()} inset allowTransfer showStats />;
};
