import { createEffect, createMemo, createSignal, onCleanup, type Setter } from 'solid-js';
import type { DFTableRequest, DFTableUnsubscribeRequest } from '../net/datafront.generated';
import type { WSClient } from '../net/ws';
import { toDatafrontError, type DatafrontError } from './error';
import type { DataFrontUpdater } from './updater';

export type UseTableQueryResult<Entity> = {
    result: () => Record<string, Entity>;
    isLoading: () => boolean;
    error: () => DatafrontError | null;
};

export type UseTableQuerySingleResult<Entity> = {
    result: () => Entity | null;
    isLoading: () => boolean;
    error: () => DatafrontError | null;
};

export type DatafrontTable<Entity, Queries extends Record<string, unknown>> = {
    useQuery<Type extends keyof Queries>(type: Type, payload: () => Queries[Type]): UseTableQueryResult<Entity>;
    useQuerySingle<Type extends keyof Queries>(
        type: Type,
        payload: () => Queries[Type],
    ): UseTableQuerySingleResult<Entity>;
};

type LocalDataEntry<ApiEntity, Entity> = {
    getter: () => { apiValue: ApiEntity; value: Entity };
    setter: Setter<{ apiValue: ApiEntity; value: Entity }>;
    uses: number;
};

export type DatafrontTableOptions<ApiEntity, Entity> = {
    name: string;
    ws: WSClient;
    updater: DataFrontUpdater;
    map: (data: ApiEntity) => Entity;
};

export function createDatafrontTable<ApiEntity, Entity, Queries extends Record<string, unknown>>({
    name,
    ws,
    updater,
    map,
}: DatafrontTableOptions<ApiEntity, Entity>): DatafrontTable<Entity, Queries> {
    const localData: Record<string, LocalDataEntry<ApiEntity, Entity>> = {};

    const cleanupUnusedSignals = () => {
        for (const id of Object.keys(localData)) {
            if (localData[id].uses <= 0) {
                delete localData[id];
            }
        }
    };

    // subscribing for lifetime, because there are not that much singletons
    // maybe cleanup will be made later, if it makes sense
    updater.subscribeToTableUpdates(name, (update) => {
        if (!localData[update.eid]) {
            return;
        }

        const patch = update.update as Partial<ApiEntity>;
        localData[update.eid].setter((old) => {
            const apiValue = { ...old.apiValue, ...patch };
            return {
                apiValue,
                value: map(apiValue),
            };
        });
    });

    const useQuery = <Type extends keyof Queries>(
        type: Type,
        payload: () => Queries[Type],
    ): UseTableQueryResult<Entity> => {
        let latestRequestId = 0;
        const [isLoading, setIsLoading] = createSignal(false);
        const [error, setError] = createSignal<DatafrontError | null>(null);
        const [resultIds, setResultIds] = createSignal<string[]>([]);

        createEffect(() => {
            resultIds(); // whenever result ids array changes
            cleanupUnusedSignals();
        });

        const retry = () => {
            const requestId = ++latestRequestId;
            setIsLoading(true);
            setError(null);

            ws.sendRequest<Record<string, ApiEntity>, DFTableRequest>('table', {
                path: name,
                query: type as string,
                payload: payload(),
                justBrowsing: false,
            })
                .then((entities) => {
                    if (requestId != latestRequestId) {
                        return;
                    }

                    const ids = Object.keys(entities);

                    for (const id of ids) {
                        if (!localData[id]) {
                            const [getter, setter] = createSignal<{ apiValue: ApiEntity; value: Entity }>({
                                apiValue: entities[id],
                                value: map(entities[id]),
                            });
                            localData[id] = {
                                getter,
                                setter,
                                uses: 1,
                            };
                        } else {
                            localData[id].setter({
                                apiValue: entities[id],
                                value: map(entities[id]),
                            });
                            ++localData[id].uses;
                        }
                    }

                    setResultIds(ids);
                    setIsLoading(false);
                })
                .catch((err: unknown) => {
                    if (requestId != latestRequestId) {
                        return;
                    }

                    setIsLoading(false);
                    setResultIds((old) => (old.length ? [] : old));

                    setError(toDatafrontError(err, retry));
                });
        };

        createEffect(retry);

        onCleanup(() => {
            ws.sendNotification<DFTableUnsubscribeRequest>('-table', {
                ids: resultIds(),
                path: name,
            });
            setError(null);
            setResultIds([]);
        });

        return {
            isLoading,
            error,
            result: createMemo(() => {
                const ids = resultIds();
                if (!ids.length) {
                    return {};
                }

                const result: Record<string, Entity> = {};
                for (const id of ids) {
                    result[id] = localData[id].getter().value;
                }

                return result;
            }),
        };
    };

    const useQuerySingle = <Type extends keyof Queries>(
        type: Type,
        payload: () => Queries[Type],
    ): UseTableQuerySingleResult<Entity> => {
        const { isLoading, error, result } = useQuery(type, payload);
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

    return { useQuery, useQuerySingle };
}
