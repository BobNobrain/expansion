import { createMemo, createSignal } from 'solid-js';
import { type WSClient } from '../net/ws';
import { type DatafrontError, toDatafrontError } from './error';
import { type DFActionRequest } from '../net/datafront.generated';

export type UseActionResult<Payload, Result> = {
    run: (payload: Payload) => void;
    result: () => Result | null;
    isLoading: () => boolean;
    error: () => DatafrontError | null;
};

export type DatafrontAction<Payload, Result> = {
    use: (idempotencyToken: () => string) => UseActionResult<Payload, Result>;
};

export type DatafrontActionOptions = {
    name: string;
    ws: WSClient;
};

export type RunningAction<P, R> = {
    run: (payload: P) => void;
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
        run: (payload) => {
            console.log('running action', canRun, payload);
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
                })
                .catch((err) => {
                    const dfErr = toDatafrontError(err, () => action.run(payload));
                    console.error('[action]', err);
                    setError(dfErr);
                    setLoading(false);
                    if (dfErr.retry) {
                        canRun = true;
                    }
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
                console.log('getAction', token, runningActions[token]);
                if (!runningActions[token]) {
                    runningActions[token] = createRunningAction((payload) => {
                        console.log('FFFUUUU');
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
                run: (p) => getAction().run(p),
            };
        },
    };
}
