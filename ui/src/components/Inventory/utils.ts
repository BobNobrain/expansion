import type { SemanticColor } from '@/lib/appearance';
import type { InventoryDisplayMode, InventoryEntry, InventoryEntryWithData } from './types';
import { createMemo } from 'solid-js';
import { useAsset } from '@/lib/solid/asset';
import { commoditiesAsset } from '@/lib/assetmanager';

export function useEnrichedEntries(entries: () => InventoryEntry[]): () => InventoryEntryWithData[] {
    const commodities = useAsset(commoditiesAsset);

    return createMemo(() => {
        const data = commodities() ?? {};

        return entries().map((entry): InventoryEntryWithData => {
            return {
                ...entry,
                mass: data[entry.commodity]?.size.mass ?? 1,
                volume: data[entry.commodity]?.size.volume ?? 1,
                quantized: data[entry.commodity]?.quantized ?? false,
            };
        });
    });
}

export function getDeltaColor(delta: string): SemanticColor {
    if (delta === '--') {
        return 'secondary';
    } else if (delta.startsWith('+')) {
        return 'success';
    } else if (delta.startsWith('-')) {
        return 'error';
    }

    return 'secondary';
}

export function getDisplaySettings(mode: InventoryDisplayMode | undefined) {
    let amounts = true;
    let speeds = false;

    switch (mode) {
        case 'speeds':
            speeds = true;
            amounts = false;
            break;

        case 'both':
            speeds = true;
            break;
    }

    return { amounts, speeds };
}
