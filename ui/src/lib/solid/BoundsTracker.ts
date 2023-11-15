import { createSignal, onCleanup } from 'solid-js';

export type BoundsTracker<T extends HTMLElement> = {
    getBounds(): DOMRect;
    ref: (el: T) => void;
};

export function createBoundsTracker<T extends HTMLElement>(): BoundsTracker<T> {
    let el: T | null = null;
    const [getBounds, setBounds] = createSignal<DOMRect>(new DOMRect());

    const updateBounds = () => {
        if (!el) {
            return;
        }

        const newBounds = el.getBoundingClientRect();
        setBounds((oldBounds) => (eq(oldBounds, newBounds) ? oldBounds : newBounds));
    };

    window.addEventListener('resize', updateBounds);

    onCleanup(() => {
        window.removeEventListener('resize', updateBounds);
    });

    return {
        ref: (value) => {
            el = value;
            setTimeout(updateBounds, 0);
        },
        getBounds,
    };
}

const eq = (r1: DOMRect, r2: DOMRect): boolean => {
    return (
        r1 === r2 ||
        (r1.x === r2.x &&
            r1.y === r2.y &&
            r1.width === r2.width &&
            r1.height === r2.height &&
            r1.bottom == r2.bottom &&
            r1.right === r2.right)
    );
};
