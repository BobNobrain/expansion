export type Signalify<T> = {
    [key in keyof T]: () => T[key];
};
