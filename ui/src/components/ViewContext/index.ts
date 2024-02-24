import { createContext, useContext } from 'solid-js';

export type ViewContext = {
    getTitle: () => string;
    getSubtitle: () => string | undefined;
    setTitle: (title: string, subtitle?: string) => void;
    setSubtitle: (subtitle: string | undefined) => void;
};

const outOfContext = () => {
    throw new Error(`This component should be rendered inside ViewContext`);
};

const ViewContext = createContext<ViewContext>({
    getTitle: outOfContext,
    getSubtitle: outOfContext,
    setTitle: outOfContext,
    setSubtitle: outOfContext,
});

export const useViewContext = () => useContext(ViewContext);
export const ViewContextProvider = ViewContext.Provider;
