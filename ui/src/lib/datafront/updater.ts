import type {
    DFSingletonUpdatePatch,
    DFTableQueryUpdateNotification,
    DFTableUpdatePatch,
    DFUpdateEvent,
} from '../net/datafront.generated';
import type { WSClient } from '../net/ws';

type TableListener = (update: DFTableUpdatePatch) => void;
type SingletonListener = (update: DFSingletonUpdatePatch) => void;
type QueryListener = (update: DFTableQueryUpdateNotification) => void;

export type DataFrontUpdater = {
    subscribeToTableUpdates: (path: string, listener: TableListener) => number;
    subscribeToSingletonUpdates: (path: string, listener: SingletonListener) => number;
    subscribeToQueryUpdates: (path: string, listener: QueryListener) => number;
    unsubscribe: (path: string, listenerId: number) => void;
};

export function createDatafrontUpdater(ws: WSClient): DataFrontUpdater {
    const tableListeners: Record<string, Record<number, TableListener>> = {};
    const singletonListeners: Record<string, Record<number, SingletonListener>> = {};
    const queryListeners: Record<string, Record<number, QueryListener>> = {};
    let idSeq = 0;

    ws.subscribe('update', ({ payload }) => {
        const updates = payload as DFUpdateEvent;

        for (const update of updates.singletons ?? []) {
            const listeners = Object.values(singletonListeners[update.path] ?? {});
            for (const l of listeners) {
                l(update);
            }
        }

        for (const update of updates.tables ?? []) {
            const listeners = Object.values(tableListeners[update.path] ?? {});
            for (const l of listeners) {
                l(update);
            }
        }

        for (const update of updates.queries ?? []) {
            const listeners = Object.values(queryListeners[update.path] ?? {});
            for (const l of listeners) {
                l(update);
            }
        }
    });

    return {
        subscribeToSingletonUpdates(path, listener) {
            const listenerId = ++idSeq;
            if (!singletonListeners[path]) {
                singletonListeners[path] = {};
            }
            singletonListeners[path][listenerId] = listener;
            return listenerId;
        },
        subscribeToTableUpdates(path, listener) {
            const listenerId = ++idSeq;
            if (!tableListeners[path]) {
                tableListeners[path] = {};
            }
            tableListeners[path][listenerId] = listener;
            return listenerId;
        },
        subscribeToQueryUpdates(path, listener) {
            const listenerId = ++idSeq;
            if (!queryListeners[path]) {
                queryListeners[path] = {};
            }
            queryListeners[path][listenerId] = listener;
            return listenerId;
        },
        unsubscribe(path, listenerId) {
            if (tableListeners[path]?.[listenerId]) {
                delete tableListeners[path][listenerId];
            }
            if (singletonListeners[path]?.[listenerId]) {
                delete singletonListeners[path][listenerId];
            }
        },
    };
}
