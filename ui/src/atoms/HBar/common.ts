import { createContext, createMemo, onCleanup, onMount, useContext, type JSX } from 'solid-js';
import { type SemanticColor } from '@/lib/appearance';
import styles from './HBar.module.css';

export type HBarStyle = 'full' | 'hollow' | 'loading';

export type HBarStyleProps = {
    color?: SemanticColor;
    style?: HBarStyle;
    dark?: boolean;
};

export function useHBarClasses(props: () => HBarStyleProps | undefined): () => Record<string, boolean | undefined> {
    return createMemo(() => ({
        [styles[props()?.color ?? 'secondary']]: true,
        [styles[props()?.style ?? 'full']]: true,
        [styles.dark]: props()?.dark,
    }));
}

export type HBarRowContext = {
    getPixelsClaimed: () => number;
    claimPixels: (px: number) => void;
};

const HBarRowContext = createContext<HBarRowContext>({
    getPixelsClaimed: () => 0,
    claimPixels: () => {},
});

export const HBarRowContextProvider = HBarRowContext.Provider;

export function useShareStyles(
    props: { share: number },
    { claimPixels }: { claimPixels?: number } = {},
): () => JSX.CSSProperties {
    const ctx = useContext(HBarRowContext);

    if (claimPixels) {
        onMount(() => ctx.claimPixels(claimPixels));
        onCleanup(() => ctx.claimPixels(-claimPixels));
    }

    return createMemo(() => {
        const totalClaimed = ctx.getPixelsClaimed();
        const selfClaimed = claimPixels ?? 0;

        if (totalClaimed === 0) {
            return {
                width: `${(props.share * 100).toFixed(3)}%`,
            };
        }

        if (selfClaimed === 0) {
            return {
                width: `calc(${props.share.toFixed(5)} * (100% - ${totalClaimed}px))`,
            };
        }

        return {
            width: `calc(${props.share.toFixed(5)} * (100% - ${totalClaimed}px) + ${selfClaimed}px)`,
        };
    });
}
