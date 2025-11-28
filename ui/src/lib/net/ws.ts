import type {} from './types.generated';
import type { DFGenericResponse, DFGenericEvent, DFError, DFGenericRequest } from './datafront.generated';
import { createSignal } from 'solid-js';

type PendingRequests = {
    id: number;
    resolve: (result: unknown) => void;
    reject: (err: WSError) => void;
};

type EventSubscriber = (event: DFGenericEvent) => void;
type OutboxItem = { payload: string };

export type RequestType =
    | 'table'
    | '-table'
    | 'query'
    | '-query'
    | 'singleton'
    | '-singleton'
    | 'log'
    | '-log'
    | 'action';

class WSClient {
    public readonly isOnline: () => boolean;
    private setIsOnline: (value: boolean) => void;

    public readonly isConnecting: () => boolean;
    private setIsConnecting: (value: boolean) => void;

    private sock?: WebSocket;

    private commandSeq = 1;
    private pendingCommands: Record<number, PendingRequests> = {};
    private subs: Record<string, EventSubscriber[]> = {};

    private outbox: OutboxItem[] = [];
    private shouldReconnect = true;

    constructor() {
        const [getIsOnline, setIsOnline] = createSignal(false);
        this.isOnline = getIsOnline;
        this.setIsOnline = setIsOnline;

        const [getIsConnecting, setIsConnecting] = createSignal(false);
        this.isConnecting = getIsConnecting;
        this.setIsConnecting = setIsConnecting;
    }

    connect(): Promise<void> {
        if (this.sock) {
            console.debug('[ws] connection already in progress');
            return new Promise((resolve, reject) => {
                this.sock!.addEventListener('open', () => resolve());
                this.sock!.addEventListener('error', reject);
            });
        }
        this.sock = new WebSocket(`ws://${window.location.host}/sock`);
        console.debug('[ws] connecting...');
        this.setIsConnecting(true);

        this.sock.addEventListener('message', (ev) => {
            const parsed = JSON.parse(ev.data as string) as DFGenericEvent | DFGenericResponse;

            if ('requestId' in parsed) {
                const id = parsed.requestId;
                const pendingCmd = this.pendingCommands[id];
                if (!pendingCmd) {
                    console.error('no pending cmd found with id', id);
                    console.error(parsed);
                    return;
                }

                console.debug('[>res]', `#${parsed.requestId}`, parsed.error ?? parsed.result ?? '<empty>');

                if (parsed.error) {
                    pendingCmd.reject(new WSError(parsed.error));
                } else {
                    pendingCmd.resolve(parsed.result);
                }
                return;
            }

            this.handleEvent(parsed);
        });

        this.sock.addEventListener('open', () => {
            console.log('[ws] open');
            this.setIsOnline(true);
            this.setIsConnecting(false);
            this.flushOutbox();
        });
        this.sock.addEventListener('close', (ev) => {
            console.error('[ws] close: ' + ev.reason, ev);
            this.setIsOnline(false);
            this.sock?.close();
            this.sock = undefined;

            this.tryReconnecting();
        });
        this.sock.addEventListener('error', (error) => {
            console.error('[ws] error', error);
            this.setIsOnline(false);
            this.setIsConnecting(false);
            this.sock?.close();
            this.sock = undefined;

            this.tryReconnecting();
        });

        this.shouldReconnect = true;

        return new Promise((resolve, reject) => {
            this.sock!.addEventListener('open', () => resolve());
            this.sock!.addEventListener('error', reject);
        });
    }

    disconnect() {
        this.sock?.close();
        this.sock = undefined;
        this.shouldReconnect = false;
    }

    sendRequest<T, P = unknown>(type: RequestType, payload?: P): Promise<T> {
        const commandId = this.commandSeq++;

        return new Promise<unknown>((resolve, reject) => {
            this.pendingCommands[commandId] = {
                id: commandId,
                resolve: resolve,
                reject,
            };

            const cmd: DFGenericRequest = {
                id: commandId,
                type,
                request: payload,
            };
            console.debug('[req>]', `#${cmd.id} ${cmd.type}`, cmd.request);
            this.outbox.push({ payload: JSON.stringify(cmd) });
            this.flushOutbox();
        }) as Promise<T>;
    }
    sendNotification<P = unknown>(type: RequestType, payload?: P): void {
        const commandId = this.commandSeq++;

        if (!this.sock) {
            return;
        }

        const cmd: DFGenericRequest = {
            id: commandId,
            type,
            request: payload,
        };
        console.debug('[not>]', `#${cmd.id} ${cmd.type}`, cmd);
        this.outbox.push({ payload: JSON.stringify(cmd) });
        this.flushOutbox();
    }

    subscribe(event: string, handler: EventSubscriber) {
        if (!this.subs[event]) {
            this.subs[event] = [];
        }
        this.subs[event].push(handler);
    }
    unsubscribe(event: string, handler: EventSubscriber) {
        const handlers = this.subs[event] ?? [];
        const removed = handlers.filter((h) => h !== handler);
        if (removed.length) {
            this.subs[event] = removed;
        } else {
            delete this.subs[event];
        }
    }

    private handleEvent(evt: DFGenericEvent) {
        console.debug(`[>evt] ${evt.event}`, evt.payload);

        const handlers = this.subs[evt.event] ?? [];
        for (const handler of handlers) {
            handler(evt);
        }
    }

    private flushOutbox() {
        if (!this.sock || this.sock.readyState !== this.sock.OPEN) {
            return;
        }

        const failed: OutboxItem[] = [];
        for (const item of this.outbox) {
            try {
                this.sock.send(item.payload);
            } catch (error) {
                console.error('[ws flush]', error);
                failed.push(item);
            }
        }

        this.outbox = failed;
    }

    private tryReconnecting() {
        setTimeout(() => {
            if (!this.shouldReconnect || this.sock) {
                return;
            }

            this.connect().catch(() => {
                this.tryReconnecting();
            });
        }, 1000);
    }
}

export const ws = new WSClient();
export type { WSClient };

// @ts-expect-error temporary global variable for testing purposes
window.ws = ws;

export class WSError extends Error {
    readonly code: string;
    readonly details: unknown;
    readonly isRetriable: boolean;

    constructor(
        response: DFError = {
            code: '--',
            message: '--',
            isRetriable: false,
            details: undefined,
        },
    ) {
        super(response.message);
        this.code = response.code;
        this.details = response.details;
        this.isRetriable = response.isRetriable;
    }
}
