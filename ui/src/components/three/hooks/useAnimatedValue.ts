import { createEffect, createSignal, untrack } from 'solid-js';
import { useSceneRenderer } from '../context';

export type UseAnimatedValueProps<T> = {
    target: () => T;
    interpolate: (initial: T, target: T, progress: number) => T;
    durationMs: number;
    eq?: (a: T, b: T) => boolean;
};

export function useAnimatedValue<T>({ target, interpolate, durationMs, eq }: UseAnimatedValueProps<T>): () => T {
    const [getAnimated, setAnimated] = createSignal<T>(target());
    const { animation } = useSceneRenderer();

    const setAnimatedButWithFixedTypes: (t: T) => void = setAnimated;

    let activeAnimationId: number | undefined;

    createEffect(() => {
        const t = target();
        const current = untrack(getAnimated);

        if (activeAnimationId) {
            animation.off(activeAnimationId);
        }

        const areEqual = eq ? eq(current, t) : current === t;
        if (areEqual) {
            return;
        }

        let start: number | undefined;
        activeAnimationId = animation.on(({ time }) => {
            if (start === undefined) {
                start = time;
            }

            const elapsed = time - start;
            const progress = Math.min(1, elapsed / durationMs);

            if (elapsed >= durationMs) {
                setAnimatedButWithFixedTypes(t);
                animation.off(activeAnimationId!);
                return;
            }

            const newValue = interpolate(current, t, progress);
            const hasReachedTarget = eq ? eq(newValue, t) : newValue === t;

            if (hasReachedTarget) {
                setAnimatedButWithFixedTypes(t);
                animation.off(activeAnimationId!);
                return;
            }

            setAnimatedButWithFixedTypes(newValue);
        });
    });

    return getAnimated;
}

export type UseAnimatedNumberProps = {
    target: () => number;
    durationMs: number;
    eps?: number;
};

export function useAnimatedNumber({ target, durationMs, eps = 1e-5 }: UseAnimatedNumberProps): () => number {
    const interpolate = (initial: number, target: number, progress: number): number => {
        const current = (target - initial) * progress + initial;
        if (Math.abs(current - target) < eps) {
            return target;
        }
        return current;
    };
    return useAnimatedValue({ durationMs, target, interpolate });
}
