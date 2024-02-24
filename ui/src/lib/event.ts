export type Listener<T> = (t: T) => void;

export type Listenable<T> = {
    on: (l: Listener<T>) => number;
    off: (id: number) => void;
};

export type Triggerable<T> = {
    trigger: (t: T) => void;
};

export type EventController = {
    length: () => number;
    clear: () => void;
};

export function createEvent<T>(): Listenable<T> & Triggerable<T> & EventController {
    let seq = 0;
    const listeners: Record<number, Listener<T>> = {};

    const event: Listenable<T> & Triggerable<T> & EventController = {
        on: (l) => {
            const id = ++seq;
            listeners[id] = l;
            return id;
        },
        off: (id) => {
            delete listeners[id];
        },

        trigger: (t) => {
            for (const l of Object.values(listeners)) {
                l(t);
            }
        },

        length: () => Object.keys(listeners).length,
        clear: () => {
            for (const key of Object.keys(listeners) as unknown as number[]) {
                delete listeners[key];
            }
        },
    };
    return event;
}
