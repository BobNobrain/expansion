import type { ParentComponent } from 'solid-js';
import styles from './HorizontalPanes.module.css';

export type HorizontalPaneProps = {
    // disabled?: boolean;
};

export const HorizontalPane: ParentComponent<HorizontalPaneProps> = (props) => {
    return <div class={styles.pane}>{props.children}</div>;
};
