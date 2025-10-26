import { type Component, For } from 'solid-js';
import { A } from '@solidjs/router';
import { type Icon } from '@/icons';
import styles from './TouchNavBar.module.css';

export type TouchNavBarItem = {
    icon: Icon;
    title: string;
    href: string;
};

export type TouchNavBarProps = {
    items: TouchNavBarItem[];
};

export const TouchNavBar: Component<TouchNavBarProps> = (props) => {
    return (
        <nav class={styles.bar}>
            <For each={props.items}>
                {(item) => {
                    return (
                        <A class={styles.item} href={item.href} activeClass={styles.active}>
                            <item.icon size={40} />
                            <span class={styles.label}>{item.title}</span>
                        </A>
                    );
                }}
            </For>
        </nav>
    );
};
