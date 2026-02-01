import { createSignal } from 'solid-js';

type CacheEntry<A, E> = {
    getData: () => A | null;
    getEntity: () => E | null;
    setData: (a: A) => void;
    setEntity: (e: E) => void;
    clearData: () => void;

    uses: number;
    state: CacheEntryState;
    // TODO: use version to ensure the updates don't mix up
    // version: number;
};

type CacheEntryState = 'done' | 'loading' | 'created' | 'deleted';

export class DatafrontTableCache<ApiEntity, Entity> {
    private entries: Record<string, CacheEntry<ApiEntity, Entity>> = {};

    constructor(private map: (d: ApiEntity) => Entity) {}

    useIds(ids: string[]) {
        for (const id of ids) {
            this.getOrCreate(id).uses++;
        }
    }
    releaseIds(ids: string[]) {
        for (const id of ids) {
            const entry = this.entries[id];
            if (!entry) {
                continue;
            }

            entry.uses--;
        }
    }
    cleanup(): string[] {
        const unusedIds: string[] = [];
        for (const id of Object.keys(this.entries)) {
            if (this.entries[id].uses <= 0) {
                delete this.entries[id];
                unusedIds.push(id);
            }
        }
        return unusedIds;
    }

    hasDataFor(id: string): boolean {
        const entry = this.entries[id];
        if (!entry) {
            return false;
        }
        return entry.state === 'done' || entry.state === 'loading';
    }
    get(ids: string[]): Record<string, Entity> {
        const result: Record<string, Entity> = {};
        for (const id of ids) {
            const entity = this.getOrCreate(id).getEntity();
            if (entity) {
                result[id] = entity;
            }
        }
        return result;
    }
    markLoading(ids: string[], loading: boolean) {
        const state: CacheEntryState = loading ? 'loading' : 'created';
        for (const id of ids) {
            const entry = this.entries[id];
            if (!entry) {
                continue;
            }
            entry.state = state;
        }
    }
    put(id: string, data: ApiEntity) {
        const entry = this.getOrCreate(id);
        entry.setData(data);
        entry.setEntity(this.map(data));
        entry.state = 'done';
    }
    putAll(all: Record<string, ApiEntity>) {
        for (const id of Object.keys(all)) {
            this.put(id, all[id]);
        }
    }
    patch(id: string, patch: Partial<ApiEntity>) {
        const entry = this.entries[id];
        if (!entry) {
            return;
        }

        const prevData = entry.getData();
        if (!prevData) {
            // nothing to update yet
            return;
        }

        const newData = { ...prevData, ...patch };
        entry.setData(newData);
        entry.setEntity(this.map(newData));
    }
    remove(id: string) {
        const entry = this.entries[id];
        if (!entry) {
            return;
        }

        entry.clearData();
        delete this.entries[id];
    }

    private getOrCreate(id: string): CacheEntry<ApiEntity, Entity> {
        if (!this.entries[id]) {
            this.entries[id] = createCacheEntry();
        }
        return this.entries[id];
    }
}

function createCacheEntry<A, E>(): CacheEntry<A, E> {
    const [getData, setData] = createSignal<A | null>(null);
    const [getEntity, setEntity] = createSignal<E | null>(null);

    const entry: CacheEntry<A, E> = {
        getData,
        setData,
        getEntity,
        setEntity,
        clearData: () => {
            setData(null);
            setEntity(null);
            entry.state = 'deleted';
        },
        uses: 0,
        state: 'created',
    };
    return entry;
}
