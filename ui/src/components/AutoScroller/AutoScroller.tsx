import { createMemo, createSignal, onCleanup, type JSX, type ParentComponent } from 'solid-js';
import { createBoundsTracker } from '../../lib/solid/BoundsTracker';
import styles from './AutoScroller.module.css';

const PX_PER_SECOND = 12;
const DELAY_MS = 700;

export const AutoScroller: ParentComponent = (props) => {
    const scroller = createBoundsTracker({ useInterval: false });
    const [isAnimationRunning, setAnimationRunning] = createSignal(true);

    const style = createMemo<JSX.CSSProperties>(() => {
        const scrollerBox = scroller.getBounds();
        const scrollerScroll = scroller.getScroll();

        const distanceToTravelPx = 2 * (scrollerScroll.scrollWidth - scrollerBox.width);
        console.log(distanceToTravelPx, scrollerScroll.scrollWidth, scrollerBox.width);
        const durationMs = Math.round((distanceToTravelPx / PX_PER_SECOND) * 1000);

        return {
            '--auto-scroller-width': scrollerBox.width + 'px',
            '--auto-scroller-duration': durationMs + 'ms',
        };
    });

    let timeoutId: number | undefined;
    const pauseAnimation = () => {
        console.log('iteration');
        setAnimationRunning(false);
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => setAnimationRunning(true), DELAY_MS);
    };

    onCleanup(() => {
        clearTimeout(timeoutId);
    });

    return (
        <div class={styles.scroller} ref={scroller.ref} style={style()}>
            <div
                class={styles.content}
                classList={{
                    [styles.running]: isAnimationRunning(),
                }}
                onAnimationIteration={pauseAnimation}
            >
                {props.children}
            </div>
        </div>
    );
};
