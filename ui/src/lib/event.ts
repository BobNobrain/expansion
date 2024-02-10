export type Listener<T> = (t: T) => void;

export type Listenable<T> = {
    on: (l: Listener<T>) => number;
    off: (id: number) => void;
};

export type Triggerable<T> = {
    trigger: (t: T) => void;
};

export function createEvent<T>(): Listenable<T> & Triggerable<T> {
    let seq = 0;
    const listeners: Record<number, Listener<T>> = {};

    const event: Listenable<T> & Triggerable<T> = {
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
    };
    return event;
}
