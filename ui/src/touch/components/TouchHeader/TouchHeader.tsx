import { type ParentComponent, type Component, createEffect } from 'solid-js';
import styles from './TouchHeader.module.css';

export const TouchHeaderButton: ParentComponent<{
    onClick?: () => void;
}> = (props) => {
    createEffect(() => {
        console.log('fx', props.onClick);
    });
    const onClick = () => {
        props.onClick?.();
    };
    return (
        <button class={styles.button} onClick={onClick}>
            {props.children}
        </button>
    );
};

export const TouchHeaderTitle: Component<{ title: string; subtitle?: string }> = (props) => {
    return (
        <div class={styles.text}>
            <h2
                classList={{
                    [styles.title]: true,
                    [styles.withSubtitle]: Boolean(props.subtitle),
                }}
            >
                {props.title}
            </h2>
            <h4 class={styles.subtitle}>{props.subtitle}</h4>
        </div>
    );
};

export const TouchHeader: ParentComponent = (props) => {
    return <header class={styles.header}>{props.children}</header>;
};
