export function stopPropagation(ev: { stopPropagation: () => void }) {
    ev.stopPropagation();
}

export function mapValues<K extends PropertyKey, V, U>(
    object: Partial<Record<K, V>>,
    f: (value: V, key: K, obj: Partial<Record<K, V>>) => U,
): Record<K, U> {
    const result = {} as Record<K, U>;

    for (const key of Object.keys(object) as K[]) {
        result[key] = f(object[key]!, key, object);
    }

    return result;
}
