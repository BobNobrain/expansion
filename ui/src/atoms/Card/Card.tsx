import type { ParentComponent } from 'solid-js';
import styles from './Card.module.css';

export type CardProps = {
    noPadding?: boolean;
    onClick?: (ev: MouseEvent) => void;
};

export const Card: ParentComponent<CardProps> = (props) => {
    return (
        <div
            class={styles.card}
            classList={{
                [styles.noPadding]: props.noPadding,
            }}
            onClick={props.onClick}
        >
            {props.children}
        </div>
    );
};
