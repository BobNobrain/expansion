import { createMemo } from 'solid-js';
import type { UseTableResult } from './types';

export function useSingleEntity<T>(table: UseTableResult<T>): () => T | null {
    return createMemo(() => {
        const entities = table.result();
        const ids = Object.keys(entities);

        if (ids.length !== 1) {
            if (ids.length > 1) {
                console.warn('useSingle was used on a table query that returned multiple rows!', entities);
            }

            return null;
        }

        return entities[ids[0]];
    });
}
