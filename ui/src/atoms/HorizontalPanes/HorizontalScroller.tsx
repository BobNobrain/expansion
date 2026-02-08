import { createEffect, type ParentComponent } from 'solid-js';
import styles from './HorizontalPanes.module.css';

export type HorizontalScrollerProps = {
    userScrollable?: boolean;
    height?: string;

    scrollIndex?: number;
    onScrolled?: (newIndex: number) => void;
};

export const HorizontalScroller: ParentComponent<HorizontalScrollerProps> = (props) => {
    let scroller!: HTMLDivElement;

    const manualScrollTo = (idx: number) => {
        const currentPos = scroller.scrollLeft;
        const newPos = scroller.getBoundingClientRect().width * idx;
        if (Math.abs(currentPos - newPos) > 2) {
            scroller.scrollTo({ left: newPos, behavior: 'smooth' });
        }
    };

    createEffect(() => {
        const idx = props.scrollIndex;
        if (idx === undefined) {
            return;
        }

        manualScrollTo(idx);
    });

    const handleScrollEnd = () => {
        if (!props.onScrolled) {
            return;
        }

        const newIdx = Math.floor(scroller.scrollLeft / scroller.getBoundingClientRect().width);
        if (newIdx !== props.scrollIndex) {
            props.onScrolled?.(newIdx);
        }

        setTimeout(() => {
            const idx = props.scrollIndex;
            if (idx === undefined) {
                return;
            }

            manualScrollTo(idx);
        }, 0);
    };

    return (
        <div
            ref={scroller}
            class={styles.scroller}
            classList={{
                [styles.noUserScroll]: !props.userScrollable,
            }}
            style={{ height: props.height }}
            on:scrollend={props.onScrolled ? handleScrollEnd : undefined}
        >
            {props.children}
        </div>
    );
};
