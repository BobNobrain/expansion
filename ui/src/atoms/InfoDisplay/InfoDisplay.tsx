import { type JSX, type ParentComponent, Show } from 'solid-js';
import type { Icon } from '@/icons';
import styles from './InfoDisplay.module.css';
import { Dynamic } from 'solid-js/web';

export type InfoDisplayProps = {
    title?: string;
    titleIcon?: Icon;
    titleAlignment?: 'center' | 'start';
    actions?: JSX.Element;
};

export const InfoDisplay: ParentComponent<InfoDisplayProps> = (props) => {
    return (
        <div class={styles.display}>
            <Show when={props.title}>
                <h2
                    class={styles.title}
                    classList={{
                        [styles.alignStart]: props.titleAlignment === 'start',
                    }}
                >
                    <Show when={props.titleIcon}>
                        <Dynamic component={props.titleIcon} size={32} />
                    </Show>
                    <span class={styles.titleText}>{props.title}</span>
                </h2>
            </Show>
            <p class={styles.text}>{props.children}</p>

            <Show when={props.actions}>
                <div class={styles.actions}>{props.actions}</div>
            </Show>
        </div>
    );
};
