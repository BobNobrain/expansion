import { createMemo, type JSX, type Component, onMount, onCleanup } from 'solid-js';
import { createTouchGestureManager } from '@/lib/gestures/TouchGestureManager';
import { useEventListener } from '@/lib/solid/useEventListener';
import { type HBarStyleProps, useHBarClasses, useShareStyles } from './common';
import styles from './HBar.module.css';

export type HBarSliderProps = {
    share: number;

    /** A value in [0; 1] (unless `valueRange` is specified) */
    value: number;
    onUpdate?: (value: number) => void;
    /**
     * Specifies that `value` is in range [from; to].
     * @default {from: 0, to: 1} // unit range
     */
    valueRange?: {
        from: number;
        to: number;
    };
    /**
     * Snaps outputted values to a number grid, i.e. N * `valueStep`.
     * If `valueRange` is specified, the grid starts at `valueRange.from`,
     * i.e. `value` = N * `valueStep` + `valueRange.from`.
     */
    valueStep?: number;

    left?: HBarStyleProps;
    right?: HBarStyleProps;
};

const HANDLE_SIZE_PX = 24;

export const HBarSlider: Component<HBarSliderProps> = (props) => {
    const wrapperStyle = useShareStyles(props, { claimPixels: HANDLE_SIZE_PX });

    const positionStyles = createMemo<{ left: JSX.CSSProperties; handle: JSX.CSSProperties }>(() => {
        const unitValue = props.valueRange
            ? (props.value - props.valueRange.from) / (props.valueRange.to - props.valueRange.from)
            : props.value;

        const pos = `calc(${unitValue.toFixed(5)} * (100% - ${HANDLE_SIZE_PX}px))`;

        return {
            left: {
                width: pos,
            },
            handle: {
                left: pos,
            },
        };
    });

    const gm = createTouchGestureManager();
    let gesturesRef!: HTMLDivElement;
    onMount(() => {
        gm.attach(gesturesRef);
    });
    onCleanup(() => {
        gm.destroy();
    });

    let lastValueBeforeDrag = NaN;
    useEventListener(gm.dragStart, () => {
        lastValueBeforeDrag = props.value;
    });
    useEventListener(gm.drag, (ev) => {
        if (!props.onUpdate) {
            return;
        }

        let change = ev.total.x / (gesturesRef.getBoundingClientRect().width - HANDLE_SIZE_PX);
        if (props.valueRange) {
            change *= props.valueRange.to - props.valueRange.from;
        }

        let newValue = lastValueBeforeDrag + change;
        if (props.valueStep) {
            newValue = Math.round(newValue / props.valueStep) * props.valueStep;
        }

        const min = props.valueRange?.from ?? 0;
        const max = props.valueRange?.to ?? 1;
        newValue = Math.max(min, Math.min(newValue, max));

        props.onUpdate(newValue);
    });

    const leftClassList = useHBarClasses(() => props.left ?? { color: 'primary' });
    const rightClassList = useHBarClasses(() => props.right ?? { style: 'hollow' });

    return (
        <div class={styles.slider} style={wrapperStyle()} ref={gesturesRef}>
            <div class={styles.sliderBarLeft} classList={leftClassList()} style={positionStyles().left} />
            <div class={styles.sliderBarRight} classList={rightClassList()} />
            <div class={styles.sliderHandle} style={positionStyles().handle} />
        </div>
    );
};
