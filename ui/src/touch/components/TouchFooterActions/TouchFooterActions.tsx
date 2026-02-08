import type { Component, ParentComponent } from 'solid-js';
import { A } from '@solidjs/router';
import styles from './TouchFooterActions.module.css';

export const TouchFooterActions: ParentComponent = (props) => {
    return <div class={styles.actions}>{props.children}</div>;
};

export type TouchFooterActionColor = 'primary' | 'semiprimary' | 'secondary' | 'error' | 'success';

const colorStyles = {
    primary: styles.colorPrimary,
    semiprimary: styles.colorSemiprimary,
    secondary: styles.colorSecondary,
    error: styles.colorError,
    success: styles.colorSuccess,
};

export type TouchFooterActionLinkProps = {
    href: string;
    replace?: boolean;
    text: string;
    color?: TouchFooterActionColor;
    loading?: boolean;
    disabled?: boolean;
};

export const TouchFooterActionLink: Component<TouchFooterActionLinkProps> = (props) => {
    return (
        <A
            class={styles.link}
            href={props.href}
            replace={props.replace}
            activeClass={styles.active}
            classList={{
                [colorStyles[props.color ?? 'secondary']]: true,
                [styles.loading]: props.loading,
                [styles.disabled]: props.disabled,
            }}
            aria-disabled={props.loading}
            onClick={(ev) => {
                if (props.loading || props.disabled) {
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
