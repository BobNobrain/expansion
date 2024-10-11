import { type ParentComponent } from 'solid-js';
import styles from './TouchSidePanel.module.css';

export type TouchSidePanelProps = {
    active: boolean;
    onClose: () => void;
    side: 'left' | 'right';
};

export const TouchSidePanel: ParentComponent<TouchSidePanelProps> = (props) => {
    const catchClicks = (ev: MouseEvent) => {
        ev.stopPropagation();
    };

    return (
        <div
            class={styles.backdrop}
            classList={{
                [styles.active]: props.active,
                [styles[props.side]]: true,
            }}
            onClick={props.onClose}
        >
            <aside class={styles.panel} onClick={catchClicks}>
                {props.children}
            </aside>
        </div>
    );
};
