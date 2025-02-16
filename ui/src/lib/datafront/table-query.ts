import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js';
import { type DFTableQueryRequest } from '../net/datafront.generated';
import { type WSClient } from '../net/ws';
import { type DatafrontCleaner } from './cleaner';
import { toDatafrontError } from './error';
import { type DatafrontTableCache } from './table-cache';
import { type DatafrontError, type DatafrontTableQuery } from './types';
import { type DataFrontUpdater } from './updater';

type Options<Payload, ApiEntity, Entity> = {
    name: string;
    hash: (p: Payload) => string;
    tableCache: DatafrontTableCache<ApiEntity, Entity>;
    updater: DataFrontUpdater;
    ws: WSClient;
    cleaner: DatafrontCleaner;
};

export function createTableQuery<Payload, ApiEntity, Entity>({
    name,
    hash,
    tableCache,
    updater,
    ws,
    cleaner,
}: Options<Payload, ApiEntity, Entity>): DatafrontTableQuery<Entity, Payload> {
    const instancesByHash: Record<string, QueryInstance> = {};

    const fetch = (payload: Payload): Promise<string[]> => {
        return ws
            .sendRequest<Record<string, ApiEntity>, DFTableQueryRequest>('query', {
                path: name,
                justBrowsing: false,
                payload,
            })
            .then((entities) => {
                tableCache.putAll(entities);
                return Object.keys(entities);
            });
    };

    const getOrCreateInstance = (hash: string, p: Payload) => {
        if (!instancesByHash[hash]) {
            instancesByHash[hash] = createQueryInstance(() => fetch(p));
        }
        return instancesByHash[hash];
    };

    updater.subscribeToQueryUpdates(name, ({ payload }) => {
        const instance = instancesByHash[hash(payload as Payload)];
        if (!instance) {
            return;
        }

        instance.trigger();
    });

    cleaner.addCleanup(() => {
        for (const hash of Object.keys(instancesByHash)) {
            const instance = instancesByHash[hash];
            if (instance.uses <= 0) {
                console.debug('[cleanup]', name, hash);
                delete instancesByHash[hash];
            }
        }
    });

    return {
        use(payload) {
            const getHash = createMemo(() => {
                const p = payload();
                if (p === null) {
                    return undefined;
                }
                return hash(p);
            });

            createEffect<string | undefined>((oldHash) => {
                const newHash = getHash();
                if (oldHash === newHash) {
                    return oldHash;
                }

                if (oldHash !== undefined && instancesByHash[oldHash]) {
                    instancesByHash[oldHash].uses--;
                }

                if (newHash !== undefined) {
                    const instance = getOrCreateInstance(newHash, payload()!);
                    instance.uses++;
                    instance.trigger();
                }

                return newHash;
            }, undefined);

            createEffect<string[]>((oldIds) => {
                const hash = getHash();
                const newIds = hash === undefined ? [] : getOrCreateInstance(hash, payload()!).resultIds();

                tableCache.useIds(newIds);
                tableCache.releaseIds(oldIds);
                // cleanupUnusedSignals();
                return newIds;
            }, []);

            onCleanup(() => {
                const hash = getHash();
                if (!hash) {
                    return;
                }
                const instance = instancesByHash[hash];
                if (!instance) {
                    return;
                }

                const ids = instance.resultIds();
                console.log(name, 'table query cleanup: releasing', ids);
                tableCache.releaseIds(ids);
                instance.uses--;
            });

            return {
                isLoading: () => {
                    const hash = getHash();
                    if (hash === undefined) {
                        return false;
                    }
                    return getOrCreateInstance(hash, payload()!).isLoading();
                },
                error: () => {
                    const hash = getHash();
                    if (hash === undefined) {
                        return null;
                    }
                    return getOrCreateInstance(hash, payload()!).error();
                },
                result: createMemo(() => {
                    const hash = getHash();
                    if (hash === undefined) {
                        return {};
                    }
                    const ids = getOrCreateInstance(hash, payload()!).resultIds();
                    return tableCache.get(ids);
                }),
            };
        },

        // @ts-expect-error Cache is exported for debugging reasons
        cache: instancesByHash,
    };
}

type QueryInstance = {
    isLoading: () => boolean;
    resultIds: () => string[];
    error: () => DatafrontError | null;
    trigger: () => void;

    uses: number;
};

function createQueryInstance(fetch: () => Promise<string[]>): QueryInstance {
    const [isLoading, setLoading] = createSignal(false);
    const [error, setError] = createSignal<DatafrontError | null>(null);
    const [resultIds, setResultIds] = createSignal<string[]>([]);
    let isInProgress = false;

    const entry: QueryInstance = {
        isLoading,
        error,
        resultIds,
        uses: 0,

        trigger: () => {
            if (isInProgress) {
                return;
            }

            isInProgress = true;
            setLoading(true);
            setError(null);

            fetch()
                .then((ids) => {
                    setResultIds(ids);
                    setLoading(false);
                    isInProgress = false;
                })
                .catch((err) => {
                    setError(toDatafrontError(err, entry.trigger));
                    setLoading(false);
                    isInProgress = false;
                });
        },
    };
    return entry;
}
