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

export function areSetsEqual<T>(s1: Set<T>, s2: Set<T>): boolean {
    if (s1.size !== s2.size) {
        return false;
    }

    for (const item of s1.values()) {
        if (!s2.has(item)) {
            return false;
        }
    }

    return true;
}
