import { type Component, Show, type JSX, For } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { IconUnknown } from '../../icons';
import { type ContentItem } from './types';
import styles from './ContentList.module.css';

export type ContentListProps = {
    header?: string | JSX.Element;
    items: ContentItem[];
};

const ContentListItem: Component<{
    item: ContentItem;
}> = (props) => {
    return (
        <li class={styles.item}>
            <div class={styles.titleRow}>
                <div class={styles.icon}>
                    <Dynamic component={props.item.icon ?? IconUnknown} size={24} />
                </div>
                <div class={styles.title}>{props.item.title}</div>
                <div class={styles.identifier}>{props.item.humanId}</div>
            </div>
            <div class={styles.propertiesRow}>
                <For each={props.item.properties}>
                    {(property) => {
                        return (
                            <div class={styles.property}>
                                <div class={styles.propertyIcon}>
                                    <Dynamic component={property.icon ?? IconUnknown} size={16} block />
                                </div>
                                <div class={styles.propertyText}>{property.text}</div>
                            </div>
                        );
                    }}
                </For>
            </div>
        </li>
    );
};

export const ContentList: Component<ContentListProps> = (props) => {
    return (
        <div class={styles.wrapper}>
            <Show when={props.header}>
                <h2 class={styles.header}>{props.header}</h2>
            </Show>

            <ul class={styles.list}>
                <For each={props.items}>
                    {(item) => {
                        return <ContentListItem item={item} />;
                    }}
                </For>
            </ul>
        </div>
    );
};
