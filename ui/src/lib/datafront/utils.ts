import { createMemo, createSignal } from 'solid-js';
import type { DatafrontError, UseTableResult } from './types';

/** @deprecated */
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

export function useSingleId(id: () => string | number | null): () => string[] | number[] {
    return createMemo(() => {
        const value = id();
        if (value === null) {
            return [];
        }
        return [value] as string[] | number[];
    });
}

export type UseSingleOptions = {
    notFoundMessage?: string;
};

export function useSingle<T>(
    table: UseTableResult<T>,
    options: UseSingleOptions = {},
): {
    result: () => T | null;
    isLoading: () => boolean;
    error: () => DatafrontError | null;
} {
    return {
        result: createMemo(() => {
            const entities = table.result();
            const ids = Object.keys(entities);

            if (ids.length !== 1) {
                if (ids.length > 1) {
                    console.warn('useSingle was used on a table query that returned multiple rows!', entities);
                }

                return null;
            }

            return entities[ids[0]];
        }),
        isLoading: table.isLoading,
        error: createMemo((): DatafrontError | null => {
            const err = table.error();
            if (err !== null) {
                return err;
            }

            const isNotFound = Object.keys(table.result()).length === 0 && !table.isLoading();

            if (isNotFound) {
                return {
                    code: 'ERR_NOT_FOUND',
                    message: options.notFoundMessage ?? 'Nothing found',
                    retry: table.retry,
                };
            }

            return null;
        }),
    };
}

export type IdempotencyTokenManager = {
    aquire: () => void;
    release: () => void;
    getToken: () => string;
};

export function createIdempotencyToken(): IdempotencyTokenManager {
    const [getCount, setCount] = createSignal(Math.floor(Math.random() * 1_000_000));
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
