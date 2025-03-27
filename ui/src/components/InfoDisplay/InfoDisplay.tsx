import { type JSX, type ParentComponent, Show } from 'solid-js';
import styles from './InfoDisplay.module.css';

export type InfoDisplayProps = {
    title?: string;
    actions?: JSX.Element;
};

export const InfoDisplay: ParentComponent<InfoDisplayProps> = (props) => {
    return (
        <div class={styles.display}>
            <Show when={props.title}>
                <h2 class={styles.title}>{props.title}</h2>
            </Show>
            <p class={styles.text}>{props.children}</p>

            <Show when={props.actions}>
                <div class={styles.actions}>{props.actions}</div>
            </Show>
        </div>
    );
};
