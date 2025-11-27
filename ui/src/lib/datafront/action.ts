import { createMemo, createSignal } from 'solid-js';
import { type DFActionRequest } from '../net/datafront.generated';
import { type WSClient } from '../net/ws';
import { toDatafrontError } from './error';
import { type DatafrontActionCallbacks, type DatafrontAction, type DatafrontError } from './types';

export type DatafrontActionOptions = {
    name: string;
    ws: WSClient;
};

export type RunningAction<P, R> = {
    run: (payload: P, callbacks?: DatafrontActionCallbacks) => void;
    result: () => R | null;
    isLoading: () => boolean;
    error: () => DatafrontError | null;
};

function createRunningAction<P, R>(impl: (payload: P) => Promise<R>): RunningAction<P, R> {
    const [result, setResult] = createSignal<R | null>(null);
    const [isLoading, setLoading] = createSignal(false);
    const [error, setError] = createSignal<DatafrontError | null>(null);
    let canRun = true;

    const action: RunningAction<P, R> = {
        run: (payload, callbacks) => {
            if (!canRun) {
                return;
            }

            canRun = false;
            setLoading(true);
            setError(null);
            impl(payload)
                .then((r) => {
                    // eslint-disable-next-line @typescript-eslint/ban-types
                    setResult(r as Exclude<R, Function>);
                    setLoading(false);
                    callbacks?.onSuccess?.();
                })
                .catch((err) => {
                    const dfErr = toDatafrontError(err, () => action.run(payload, callbacks));
                    console.error('[action]', err);
                    setError(dfErr);
                    setLoading(false);
                    if (dfErr.retry) {
                        canRun = true;
                    }

                    callbacks?.onError?.();
                });
        },
        result,
        isLoading,
        error,
    };
    return action;
}

export function createDatafrontAction<Payload, Result = void>({
    name,
    ws,
}: DatafrontActionOptions): DatafrontAction<Payload, Result> {
    const runningActions: Record<string, RunningAction<Payload, Result>> = {};

    return {
        use(idempotencyToken) {
            const getAction = () => {
                const token = idempotencyToken();
                if (!runningActions[token]) {
                    runningActions[token] = createRunningAction((payload) => {
                        return ws.sendRequest<Result, DFActionRequest>('action', {
                            name,
                            token,
                            payload,
                        });
                    });
                }
                return runningActions[token];
            };

            return {
                isLoading: createMemo(() => getAction().isLoading()),
                error: createMemo(() => getAction().error()),
                result: createMemo(() => getAction().result()),
                run: (p, c) => getAction().run(p, c),
            };
        },
    };
}
