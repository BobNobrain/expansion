import { type Component, For, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { A } from '@solidjs/router';
import { type Icon } from '../../icons';
import styles from './TabsList.module.css';

export type TabsListProps = {
    tabs: TabHeader[];
    style?: 'standalone' | 'pagetop';
    scrollable?: boolean;
};

export type TabHeader = {
    title: string;
    icon?: Icon;
    badge?: string;
    href: string;
};

export const TabsList: Component<TabsListProps> = (props) => {
    return (
        <ul
            class={styles.tabs}
            classList={{
                [styles[props.style ?? 'standalone']]: true,
                [styles.scrollable]: props.scrollable,
            }}
        >
            <For each={props.tabs}>
                {(tabHeader) => {
                    return (
                        <li class={styles.header}>
                            <A href={tabHeader.href} class={styles.link} activeClass={styles.active}>
                                <Show when={tabHeader.icon}>
                                    <Dynamic component={tabHeader.icon} size={24} />
                                </Show>
                                <span class={styles.label}>{tabHeader.title}</span>
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
