import { type ParentComponent, Show, createMemo } from 'solid-js';
import { A } from '@solidjs/router';
import styles from './Link.module.css';

export type LinkProps = {
    href: string;
};

export const Link: ParentComponent<LinkProps> = (props) => {
    const isExternal = createMemo(() => props.href.startsWith('http'));

    return (
        <Show
            when={isExternal()}
            fallback={
                <A href={props.href} class={styles.internal}>
                    {props.children}
                </A>
            }
        >
            <a href={props.href} target="_blank" rel="noopener noreferrer" class={styles.external}>
                {props.children}
            </a>
        </Show>
    );
};
