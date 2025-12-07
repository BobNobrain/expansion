import { createMemo, createSignal } from 'solid-js';
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

export type IdempotencyTokenManager = {
    aquire: () => void;
    release: () => void;
    getToken: () => string;
};

export function createIdempotencyToken(): IdempotencyTokenManager {
    const [getCount, setCount] = createSignal(0);
    let locked = false;

    const aquire = () => {
        if (locked) {
            return;
        }
        locked = true;
        setCount((c) => c + 1);
    };

    const release = () => {
        locked = false;
    };

    const getToken = createMemo(() => getCount().toString());

    return { aquire, release, getToken };
}
