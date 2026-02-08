import type { ParentComponent } from 'solid-js';
import styles from './VerticalCarousel.module.css';

export const VerticalCarouselSlide: ParentComponent = (props) => {
    return <div class={styles.slide}>{props.children}</div>;
};
