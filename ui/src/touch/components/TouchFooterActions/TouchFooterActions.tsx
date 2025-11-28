import type { Component, ParentComponent } from 'solid-js';
import styles from './TouchFooterActions.module.css';
import { A } from '@solidjs/router';

export const TouchFooterActions: ParentComponent = (props) => {
    return <div class={styles.actions}>{props.children}</div>;
};

export type TouchFooterActionColor = 'primary' | 'semiprimary' | 'secondary';

const colorStyles = {
    primary: styles.colorPrimary,
    semiprimary: styles.colorSemiprimary,
    secondary: styles.colorSecondary,
};

export type TouchFooterActionLinkProps = {
    href: string;
    text: string;
    color?: TouchFooterActionColor;
    loading?: boolean;
};

export const TouchFooterActionLink: Component<TouchFooterActionLinkProps> = (props) => {
    return (
        <A
            class={styles.link}
            href={props.href}
            activeClass={styles.active}
            classList={{
                [colorStyles[props.color ?? 'secondary']]: true,
                [styles.loading]: props.loading,
            }}
            aria-disabled={props.loading}
            onClick={(ev) => {
                if (props.loading) {
                    ev.preventDefault();
                }
            }}
        >
            <span class={styles.label}>{props.text}</span>
        </A>
    );
};

export type TouchFooterActionButtonProps = {
    text: string;
    color?: TouchFooterActionColor;
    onClick?: (ev: MouseEvent) => void;
    disabled?: boolean;
    loading?: boolean;
};

export const TouchFooterActionButton: Component<TouchFooterActionButtonProps> = (props) => {
    return (
        <button
            type="button"
            class={styles.button}
            onClick={props.onClick}
            disabled={props.disabled || props.loading}
            classList={{
                [styles.disabled]: props.disabled,
                [colorStyles[props.color ?? 'secondary']]: true,
                [styles.loading]: props.loading,
            }}
        >
            <span class={styles.label}>{props.text}</span>
        </button>
    );
};
