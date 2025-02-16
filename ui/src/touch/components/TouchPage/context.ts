import { createContext, createEffect, createSignal, onCleanup, untrack, useContext } from 'solid-js';
import type { Icon } from '../../../icons';

export type PageContextRelatedItem = {
    title: string;
    url: string;
    icon: Icon;
};

export type PageContextData = {
    title: string;
    subtitle?: string;
    goBack?: () => void;
    related: PageContextRelatedItem[];
};

export type PageContext = {
    get: () => PageContextData;
    update: (data: Partial<PageContextData>) => void;
    set: (data: PageContextData) => void;
};

export const PageContext = createContext<PageContext>({
    get: () => {
        throw new Error('out of context');
    },
    set: () => {
        throw new Error('out of context');
    },
    update: () => {
        throw new Error('out of context');
    },
});

export const usePageContext = () => useContext(PageContext);

export const createPageContext = (): PageContext => {
    const [get, set] = createSignal<PageContextData>({
        title: 'Expansion',
        related: [],
    });

    return {
        get,
        set,
        update: (data) => set((old) => ({ ...old, ...data })),
    };
};

export const usePageContextBinding = (bindings: Partial<PageContextData> | (() => Partial<PageContextData>)) => {
    const ctx = useContext(PageContext);
    const backup = untrack(ctx.get);

    if (typeof bindings === 'function') {
        createEffect(() => {
            ctx.update(bindings());
        });
    } else {
        ctx.update(bindings);
    }

    onCleanup(() => {
        ctx.set(backup);
    });
};
