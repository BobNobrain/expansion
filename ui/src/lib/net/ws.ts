import {
    type ClientCommand,
    type ServerCommandErrorResponse,
    type ServerCommandSuccessResponse,
    type ServerEvent,
} from './types.generated';

type PendingCommand = {
    id: number;
    resolve: (result: unknown) => void;
    reject: (err: WSError) => void;
};

type EventSubscriber = (event: ServerEvent) => void;

class WSClient {
    private sock?: WebSocket;

    private commandSeq = 1;
    private pendingCommands: Record<number, PendingCommand> = {};
    private subs: Record<string, EventSubscriber[]> = {};

    connect(): Promise<void> {
        this.sock = new WebSocket(`ws://${window.location.host}/sock`);

        this.sock.addEventListener('message', (ev) => {
            const parsed = JSON.parse(ev.data as string) as
                | ServerCommandSuccessResponse
                | ServerCommandErrorResponse
                | ServerEvent;

            if ('id' in parsed) {
                const id = parsed.id;
                const pendingCmd = this.pendingCommands[id];
                if (!pendingCmd) {
                    console.error('no pending cmd found with id', id);
                    console.error(parsed);
                    return;
                }

                if ('result' in parsed) {
                    pendingCmd.resolve(parsed.result);
                } else {
                    pendingCmd.reject(new WSError(parsed));
                }
                return;
            }

            this.handleEvent(parsed);
        });

        return new Promise((resolve) => {
            this.sock!.addEventListener('open', () => resolve());
        });
    }

    disconnect() {
        this.sock?.close();
    }

    sendCommand<T>(scope: string, command: string, payload: unknown): Promise<T> {
        const commandId = this.commandSeq++;

        return new Promise<unknown>((resolve, reject) => {
            if (!this.sock) {
                reject(new Error('not connected'));
                return;
            }

            this.pendingCommands[commandId] = {
                id: commandId,
                resolve: resolve,
                reject,
            };

            const cmd: ClientCommand = {
                id: commandId,
                scope,
                cmd: command,
                payload,
            };
            this.sock.send(JSON.stringify(cmd));
        }) as Promise<T>;
    }

    subscribe(scope: string, handler: EventSubscriber) {
        if (!this.subs[scope]) {
            this.subs[scope] = [];
        }
        this.subs[scope].push(handler);
    }
    unsubscribe(scope: string, handler: EventSubscriber) {
        const handlers = this.subs[scope] ?? [];
        const removed = handlers.filter((h) => h !== handler);
        if (removed.length) {
            this.subs[scope] = removed;
        } else {
            delete this.subs[scope];
        }
    }

    private handleEvent(evt: ServerEvent) {
        console.log(`[server event] ${evt.scope}/${evt.event}`, evt.payload);

        const scope = evt.scope;
        const handlers = this.subs[scope] ?? [];
        for (const handler of handlers) {
            handler(evt);
        }
    }
}

export const ws = new WSClient();

// @ts-expect-error temporary global variable for testing purposes
window.ws = ws;

export class WSError extends Error {
    readonly code: string;

    constructor(response: ServerCommandErrorResponse) {
        super(response.error);
        this.code = response.code;
    }
}
