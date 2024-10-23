import { type Component, Show, type JSX, For, createSignal } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { IconChevronRight, IconUnknown } from '../../icons';
import { type ContentItem } from './types';
import styles from './ContentList.module.css';
import { A } from '@solidjs/router';

export type ContentListProps = {
    header?: string | JSX.Element;
    items: ContentItem[];
};

const ContentListItem: Component<{
    item: ContentItem;
}> = (props) => {
    const [isExpanded, setIsExpanded] = createSignal(false);
    const toggleExpanded = () => setIsExpanded((val) => !val);

    return (
        <li
            class={styles.item}
            classList={{
                [styles.expanded]: isExpanded(),
            }}
        >
            <div class={styles.leftHalf} onClick={toggleExpanded}>
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
            </div>
            <Dynamic
                component={typeof props.item.mainAction === 'string' ? A : 'div'}
                class={styles.rightHalf}
                href={typeof props.item.mainAction === 'string' ? props.item.mainAction : undefined}
                onClick={typeof props.item.mainAction === 'function' ? props.item.mainAction : undefined}
            >
                <IconChevronRight size={32} />
            </Dynamic>
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
