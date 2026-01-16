export type DatafrontTable<Entity> = {
    useMany: (ids: () => string[] | number[]) => UseTableResult<Entity>;
    useSingle: (id: () => string | number | null) => UseTableSingleResult<Entity>;

    createQuery: <Payload>(
        name: string,
        payloadHasher?: (p: Payload) => string,
    ) => DatafrontTableQuery<Entity, Payload>;
};

export type DatafrontTableQuery<Entity, Payload> = {
    use: (payload: () => Payload | null) => UseTableResult<Entity>;
};

export type UseTableResult<Entity> = {
    result: () => Record<string, Entity>;
    isLoading: () => boolean;
    error: () => DatafrontError | null;
};

export type UseTableSingleResult<Entity> = {
    result: () => Entity | null;
    isLoading: () => boolean;
    error: () => DatafrontError | null;
};

export type DatafrontSingleton<Value> = {
    use: () => UseSingletonQueryResult<Value>;
};

export type UseSingletonQueryResult<Value> = {
    value: () => Value | null;
    isLoading: () => boolean;
    error: () => DatafrontError | null;
};

export type DatafrontAction<Payload, Result> = {
    use: (idempotencyToken: () => string) => UseActionResult<Payload, Result>;
};

export type DatafrontActionCallbacks = {
    onSuccess?: () => void;
    onError?: () => void;
};

export type UseActionResult<Payload, Result> = {
    run: (payload: Payload, callbacks?: DatafrontActionCallbacks) => void;
    result: () => Result | null;
    isLoading: () => boolean;
    error: () => DatafrontError | null;
};

export type DatafrontError = {
    code: string;
    message: string;
    details?: unknown;
    retry?: () => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DfActionPayload<T> = T extends DatafrontAction<infer Payload, any> ? Payload : never;
