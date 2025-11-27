export const outOfContext = (..._: unknown[]): never => {
    throw new Error('Out of context!');
};

export const outOfContext2 = (..._: unknown[]) => outOfContext;
