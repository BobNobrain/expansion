import { children, createMemo, createSignal, For, onMount, Show, type ParentComponent } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import type { Icon } from '@/icons';
import styles from './VerticalCarousel.module.css';

export type VerticalCarouselProps = {
    icons?: Icon | Icon[];
    height?: string;
    inset?: boolean;
};

export const VerticalCarousel: ParentComponent<VerticalCarouselProps> = (props) => {
    const resolved = children(() => props.children);
    const icons = createMemo(() => {
        const nSlides = resolved.toArray().length;
        const icons: (Icon | null)[] = new Array<Icon | null>(nSlides).fill(
            typeof props.icons === 'function' ? props.icons : null,
        );

        if (Array.isArray(props.icons)) {
            for (let i = 0; i < nSlides; i++) {
                icons[i] = props.icons[i % props.icons.length];
            }
        }

        return icons;
    });

    let scroller!: HTMLDivElement;
    const [slideIndex, setSlideIndex] = createSignal(0);

    const scrollToSlide = (index: number) => {
        const height = scroller.getBoundingClientRect().height;
        scroller.scrollTo({ top: height * index, behavior: 'smooth' });
        setSlideIndex(index);
    };

    const handleScrollEnd = () => {
        const height = scroller.getBoundingClientRect().height;
        let newIdx = Math.floor(scroller.scrollTop / height);

        if (Math.abs(newIdx * height - scroller.scrollTop) > 2) {
            const oldIdx = slideIndex();
            const dScroll = scroller.scrollTop - oldIdx * height;

            newIdx = oldIdx + Math.sign(dScroll);
            newIdx = Math.max(0, Math.min(newIdx, resolved.toArray().length - 1));

            scroller.scrollTo({ top: newIdx * height, behavior: 'smooth' });
        }

        setSlideIndex(newIdx);
    };

    onMount(() => scroller.scrollTo({ top: 0, behavior: 'instant' }));

    return (
        <div class={styles.carousel} style={{ height: props.height }} classList={{ [styles.inset]: props.inset }}>
            <ul class={styles.icons}>
                <For each={icons()}>
                    {(icon, index) => {
                        return (
                            <li
                                class={styles.icon}
                                classList={{ [styles.active]: index() === slideIndex() }}
                                onClick={() => scrollToSlide(index())}
                            >
                                <Show when={icon} fallback={<div class={styles.defaultIcon} />}>
                                    <Dynamic component={icon!} block size={12} />
                                </Show>
                            </li>
                        );
                    }}
                </For>
            </ul>
            <div ref={scroller} class={styles.scrollWrapper} on:scrollend={handleScrollEnd}>
                {props.children}
            </div>
        </div>
    );
};
