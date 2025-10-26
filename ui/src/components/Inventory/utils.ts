import type { SemanticColor } from '@/lib/appearance';
import type { InventoryEntry, InventoryEntryWithData } from './types';

export function enrichWithCommodityData(entry: InventoryEntry): InventoryEntryWithData {
    return {
        ...entry,
        // TODO: fill these from assets data
        density: 2.1,
        quantized: entry.commodity === 'steelBeams',
    };
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
