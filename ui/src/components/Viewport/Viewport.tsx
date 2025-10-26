import { createMemo, type JSX, onCleanup, onMount, type ParentComponent } from 'solid-js';
import { createTouchGestureManager } from '../../lib/gestures/TouchGestureManager';
import { useViewportMouseDrag } from './drag';
import { useViewportScale } from './scale';
import styles from './Viewport.module.css';

export type ViewportProps = {
    scaleable?: boolean;
    fillsAllSpace?: boolean;
};

export const Viewport: ParentComponent<ViewportProps> = (props) => {
    const gm = createTouchGestureManager();
    let wrapperRef!: HTMLDivElement;
    let contentRef!: HTMLDivElement;

    onMount(() => {
        gm.attach(wrapperRef);
    });
    onCleanup(() => {
        gm.destroy();
    });

    const mouseDrag = useViewportMouseDrag({ wrapper: () => wrapperRef });

    const vpScale = useViewportScale({ gm });

    const contentStyles = createMemo<JSX.CSSProperties>(() => {
        const scale = vpScale.getScale().toFixed(2);

        return {
            transform: `scale(${scale}, ${scale})`,
        };
    });

    return (
        <div
            ref={wrapperRef}
            class={styles.viewport}
            classList={{
                [styles.scaleable]: props.scaleable,
                [styles.fill]: props.fillsAllSpace,
            }}
            onWheel={vpScale.onWheel}
            onMouseDown={mouseDrag.onMouseDown}
            onMouseUp={mouseDrag.onMouseUp}
        >
            <div ref={contentRef} class={styles.content} style={contentStyles()}>
                {props.children}
            </div>
        </div>
    );
};
