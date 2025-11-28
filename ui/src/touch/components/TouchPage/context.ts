import { createContext, createEffect, createSignal, onCleanup, untrack, useContext, type Component } from 'solid-js';
import type { Icon } from '@/icons';
import { outOfContext } from '@/lib/solid/context';

export type PageContextRelatedItem = {
    title: string;
    url: string;
    icon: Icon;
};

export type PageContextButton = {
    text: string;
    action: string | (() => void);
    icon?: Icon;
    color?: 'primary' | 'semiprimary' | 'secondary';
};

export type PageContextData = {
    title: string;
    subtitle?: string;
    goBack?: () => void;
    related: PageContextRelatedItem[];
    customFooter?: Component;
};

export type PageContext = {
    get: () => PageContextData;
    update: (data: Partial<PageContextData>) => void;
    set: (data: PageContextData) => void;
};

export const PageContext = createContext<PageContext>({
    get: outOfContext,
    set: outOfContext,
    update: outOfContext,
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
