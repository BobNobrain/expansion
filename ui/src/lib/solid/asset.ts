import { createSignal } from 'solid-js';
import type { Asset } from '../assetmanager';

export type UseAssetOptions = {
    lazy?: boolean;
};

export function useAsset<T>(asset: Asset<T>, options: UseAssetOptions = {}): () => T | null {
    const [getValue, setValue] = createSignal<T | null>(null);

    const fetch = () => asset.get().then(setValue);

    if (!options.lazy) {
        void fetch();
        return getValue;
    }

    return () => {
        const value = getValue();

        if (!value) {
            void fetch();
        }

        return value;
    };
}
