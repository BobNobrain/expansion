import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js';
import type { DFTableRequest, DFTableUnsubscribeRequest } from '../net/datafront.generated';
import type { WSClient } from '../net/ws';
import { type DatafrontCleaner } from './cleaner';
import { toDatafrontError } from './error';
import { DatafrontTableCache } from './table-cache';
import { createTableQuery } from './table-query';
import {
    type DatafrontError,
    type DatafrontTable,
    type DatafrontTableQuery,
    type UseTableResult,
    type UseTableSingleResult,
} from './types';
import type { DataFrontUpdater } from './updater';

export type DatafrontTableOptions<ApiEntity, Entity> = {
    name: string;
    ws: WSClient;
    updater: DataFrontUpdater;
    cleaner: DatafrontCleaner;
    map: (data: ApiEntity) => Entity;
};

export function createDatafrontTable<ApiEntity, Entity>({
    name,
    ws,
    updater,
    cleaner,
    map,
}: DatafrontTableOptions<ApiEntity, Entity>): DatafrontTable<Entity> {
    const cache = new DatafrontTableCache(map);

    cleaner.addCleanup(() => {
        const unusedIds = cache.cleanup();
        if (!unusedIds.length) {
            return;
        }
        ws.sendNotification<DFTableUnsubscribeRequest>('-table', {
            ids: unusedIds,
            path: name,
        });
        console.debug('[cleanup]', name, unusedIds.length);
    });

    // subscribing for lifetime, because there are not that much singletons
    // maybe cleanup will be made later, if it makes sense
    updater.subscribeToTableUpdates(name, (update) => {
        const patch = update.update as Partial<ApiEntity> | null;
        if (patch === null) {
            cache.remove(update.eid);
        } else {
            cache.patch(update.eid, patch);
        }
    });

    const useMany = (ids: () => (string | number)[]): UseTableResult<Entity> => {
        let latestRequestId = 0;
        const [isLoading, setIsLoading] = createSignal(false);
        const [error, setError] = createSignal<DatafrontError | null>(null);
        const strIds = createMemo(() => ids().map(String));

        const goFetchEntities = (ids: string[]) => {
            if (!ids.length) {
                return;
            }

            const requestId = ++latestRequestId;
            setIsLoading(true);
            setError(null);
            cache.markLoading(ids, true);

            ws.sendRequest<Record<string, ApiEntity>, DFTableRequest>('table', {
                path: name,
                justBrowsing: false,
                ids,
            })
                .then((entities) => {
                    if (requestId != latestRequestId) {
                        return;
                    }

                    cache.putAll(entities);
                    setIsLoading(false);
                })
                .catch((err: unknown) => {
                    if (requestId != latestRequestId) {
                        return;
                    }

                    setIsLoading(false);
                    cache.markLoading(ids, false);
                    setError(toDatafrontError(err, () => goFetchEntities(ids)));
                });
        };

        createEffect<string[]>((prevIds) => {
            const requestedIds = strIds();
            goFetchEntities(requestedIds.filter((id) => !cache.hasDataFor(id)));

            cache.useIds(requestedIds);
            cache.releaseIds(prevIds);

            return requestedIds;
        }, []);

        onCleanup(() => {
            cache.releaseIds(strIds());
        });

        return {
            isLoading,
            error,
            result: createMemo(() => {
                const requestedIds = strIds();
                if (!requestedIds.length) {
                    return {};
                }

                return cache.get(requestedIds);
            }),
            retry: () => goFetchEntities(strIds().filter((id) => !cache.hasDataFor(id))),
        };
    };

    const useSingle = (id: () => string | number | null): UseTableSingleResult<Entity> => {
        const ids = createMemo(() => {
            const resolved = id();
            if (resolved === null) {
                return [];
            }
            return [resolved];
        });
        const { isLoading, error, result } = useMany(ids);

        return {
            isLoading,
            error,
            result: createMemo(() => {
                const byIds = result();
                const ids = Object.keys(byIds);
                if (!ids.length) {
                    return null;
                }

                return byIds[ids[0]];
            }),
        };
    };

    const createQuery = <Payload>(
        name: string,
        payloadHasher: (p: Payload) => string = JSON.stringify,
    ): DatafrontTableQuery<Entity, Payload> => {
        return createTableQuery({ name, hash: payloadHasher, tableCache: cache, updater, ws, cleaner });
    };

    return {
        useMany,
        useSingle,
        createQuery,
        // @ts-expect-error Cache is exported for debugging
        cache,
    };
}
