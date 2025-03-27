import { untrack } from 'solid-js/web';
import { useControlledAnimation } from './useAnimation';

export type ValueAnimatorOptions<T> = {
    getter: () => T;
    setter: (value: T) => void;
    interpolate: (from: T, to: T, progress: number) => T;
    timeCurve?: (linearProgress: number) => number;
};

export type ValueAnimator<T> = {
    startAnimation: (targetValue: T, durationMs: number) => void;
    stopAnimation: () => void;
};

type AnimationProperties<T> = {
    initial: T;
    started: DOMHighResTimeStamp;
    durationMs: number;
    target: T;
};

export function useValueAnimator<T>({
    getter,
    setter,
    interpolate,
    timeCurve,
}: ValueAnimatorOptions<T>): ValueAnimator<T> {
    let animationProperties: AnimationProperties<T> | null = null;

    const animation = useControlledAnimation(({ time }) => {
        if (!animationProperties) {
            animation.stop();
            return;
        }

        const progress = (time - animationProperties.started) / animationProperties.durationMs;
        const unitaryProgress = Math.max(0, Math.min(1, progress));
        const distortedProgress = timeCurve ? Math.max(0, Math.min(1, timeCurve(unitaryProgress))) : unitaryProgress;
        const newValue = interpolate(animationProperties.initial, animationProperties.target, distortedProgress);
        setter(newValue);

        if (progress >= 1) {
            animation.stop();
            animationProperties = null;
        }
    });

    const startAnimation = (targetValue: T, durationMs: number) => {
        animationProperties = {
            initial: untrack(getter),
            started: performance.now(),
            durationMs,
            target: targetValue,
        };
        animation.start();
    };

    return { startAnimation, stopAnimation: animation.stop };
}

export function easeOut(linear: number): number {
    return 1 - Math.expm1(1 - linear) / (Math.E - 1);
}
