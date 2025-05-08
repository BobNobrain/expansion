import { createSignal, type Component, type ParentComponent } from 'solid-js';
import {
    type HBarRowContext,
    HBarRowContextProvider,
    type HBarStyleProps,
    useHBarClasses,
    useShareStyles,
} from './common';
import styles from './HBar.module.css';

export const HBarRow: ParentComponent = (props) => {
    const [getPixelsClaimed, setPixelsClaimed] = createSignal(0);
    const context: HBarRowContext = {
        getPixelsClaimed,
        claimPixels: (px) => setPixelsClaimed((old) => old + px),
    };

    return (
        <div class={styles.hbarRow}>
            <HBarRowContextProvider value={context}>{props.children}</HBarRowContextProvider>
        </div>
    );
};

export type HBarProps = {
    share: number;
} & HBarStyleProps;

export const HBar: Component<HBarProps> = (props) => {
    const barStyles = useShareStyles(props);
    const classList = useHBarClasses(() => props);

    return <div class={styles.hbar} classList={classList()} style={barStyles()} />;
};
