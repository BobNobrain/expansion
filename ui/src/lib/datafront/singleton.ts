import { createMemo, createSignal } from 'solid-js';
import type { DFSingletonRequest } from '../net/datafront.generated';
import type { WSClient } from '../net/ws';
import { toDatafrontError, type DatafrontError } from './error';
import type { DataFrontUpdater } from './updater';

export type UseSingletonQueryResult<Value> = {
    value: () => Value | null;
    isLoading: () => boolean;
    error: () => DatafrontError | null;
};

export type DatafrontSingleton<Value> = {
    use: () => UseSingletonQueryResult<Value>;
};

export type DatafrontSingletonOptions<ApiValue, Value> = {
    name: string;
    ws: WSClient;
    updater: DataFrontUpdater;
    map: (value: ApiValue) => Value;
};

export function createDatafrontSingleton<ApiValue, Value>({
    name,
    updater,
    ws,
    map,
}: DatafrontSingletonOptions<ApiValue, Value>): DatafrontSingleton<Value> {
    const [isLoading, setIsLoading] = createSignal(false);
    const [error, setError] = createSignal<DatafrontError | null>(null);
    const [value, setValue] = createSignal<{ apiValue: ApiValue; value: Value } | null>(null);
    let canRefetch = true;

    const triggerFetching = () => {
        canRefetch = false;
        setIsLoading(true);
        setError(null);

        ws.sendRequest<ApiValue, DFSingletonRequest>('singleton', {
            path: name,
            justBrowsing: false,
        })
            .then((response) => {
                setValue({
                    apiValue: response,
                    value: map(response),
                });
                setIsLoading(false);
                canRefetch = false;
            })
            .catch((err) => {
                const dfError = toDatafrontError(err, triggerFetching);
                setError(dfError);
                setIsLoading(false);
                if (dfError.retry) {
                    canRefetch = true;
                }
            });
    };

    // subscribing for lifetime, because there are not that much singletons
    // maybe cleanup will be made later, if it makes sense
    updater.subscribeToSingletonUpdates(name, (update) => {
        const patch = update.update as Partial<ApiValue>;
        setValue((old) => {
            if (!old) {
                return old;
            }

            const apiValue = { ...old.apiValue, ...patch };
            return {
                apiValue,
                value: map(apiValue),
            };
        });
    });

    const use = (): UseSingletonQueryResult<Value> => {
        if (canRefetch) {
            triggerFetching();
        }

        return {
            isLoading,
            error,
            value: createMemo(() => {
                const val = value();
                return val === null ? null : val.value;
            }),
        };
    };

    return { use };
}
