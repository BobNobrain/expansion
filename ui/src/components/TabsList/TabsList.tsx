import { type Component, For, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { A } from '@solidjs/router';
import { type Icon } from '../../icons';
import styles from './TabsList.module.css';

export type TabsListProps = {
    tabs: TabHeader[];
};

export type TabHeader = {
    title: string;
    icon?: Icon;
    badge?: string;
    href: string;
};

const TabHeader: Component<{ header: TabHeader }> = (props) => {
    return (
        <>
            <Show when={props.header.icon}>
                <Dynamic component={props.header.icon} size={16} />
            </Show>
            <span class={props.header.title}>{props.header.title}</span>
            <Show when={props.header.badge}>
                <span class={props.header.badge}>{props.header.badge}</span>
            </Show>
        </>
    );
};

export const TabsList: Component<TabsListProps> = (props) => {
    return (
        <ul class={styles.tabs}>
            <For each={props.tabs}>
                {(tabHeader) => {
                    return (
                        <li class={styles.header}>
                            <A href={tabHeader.href} class={styles.link} activeClass={styles.active}>
                                <Show when={tabHeader.icon}>
                                    <Dynamic component={tabHeader.icon} size={16} />
                                </Show>
                                <span class={tabHeader.title}>{tabHeader.title}</span>
                                <Show when={tabHeader.badge}>
                                    <span class={tabHeader.badge}>{tabHeader.badge}</span>
                                </Show>
                            </A>
                        </li>
                    );
                }}
            </For>
        </ul>
    );
};
