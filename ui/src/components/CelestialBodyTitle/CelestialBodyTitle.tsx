import { Show, type Component } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { type Icon } from '../../icons';
import styles from './CelestialBodyTitle.module.css';

export type CelestialBodyTitleProps = {
    name?: string;
    id: string;
    icon?: Icon;
};

export const CelestialBodyTitle: Component<CelestialBodyTitleProps> = (props) => {
    return (
        <div class={styles.wrapper}>
            <div
                class={styles.title}
                classList={{
                    [styles.noName]: !props.name,
                }}
            >
                {props.name ?? props.id}
            </div>
            <div class={styles.badge}>
                <Show when={props.icon}>
                    <Dynamic component={props.icon} size={16} />
                </Show>
                <span class={styles.id}>{props.id}</span>
            </div>
        </div>
    );
};
