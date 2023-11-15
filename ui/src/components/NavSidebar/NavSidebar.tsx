import { type Component, For, Show } from 'solid-js';
import styles from './NavSidebar.module.css';

export interface NavSidebarItem {
    id: string;
    title: string;
    keybind?: string;
}

export interface NavSidebarProps {
    activeItem: NavSidebarItem[];
    items: NavSidebarItem[];
    onActivate: (item: NavSidebarItem) => void;
}

export const NavSidebar: Component<NavSidebarProps> = (props) => {
    return (
        <div class={styles.sidebar}>
            <For each={props.items}>
                {(item) => {
                    return (
                        <div class={styles.item} onClick={() => props.onActivate(item)}>
                            <div
                                classList={{
                                    [styles.lamp]: true,
                                    [styles.on]: props.activeItem.includes(item),
                                }}
                            ></div>
                            <span class={styles.label}>
                                {item.title}
                                <Show when={item.keybind}>
                                    <span class={styles.keybind}>[{item.keybind}]</span>
                                </Show>
                            </span>
                        </div>
                    );
                }}
            </For>
        </div>
    );
};
