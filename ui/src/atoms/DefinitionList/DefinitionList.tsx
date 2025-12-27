import { createMemo, For, type JSX } from 'solid-js';
import styles from './DefinitionList.module.css';
import { SkeletonText } from '../Skeleton';

export type DefinitionListItem<V> = {
    title: string;
    description?: string;
    render: ((value: V) => JSX.Element | null) | keyof V;
    renderLoading?: () => JSX.Element;
    skeletonLength?: number;
};

export type DefinitionListProperties<V> = Record<keyof V, DefinitionListItem<V>>;

export type DefinitionListProps<V extends Record<string, unknown>> = {
    items: DefinitionListItem<V>[];
    inset?: boolean;
    value: V | null;
    isLoading?: boolean;
};

type RenderedItem = {
    title: string;
    description?: string;
    value: JSX.Element | null;
};

export function DefinitionList<V extends Record<string, unknown>>(props: DefinitionListProps<V>) {
    const renderedItems = createMemo<RenderedItem[]>(() => {
        const items: RenderedItem[] = [];
        for (const definition of Object.values(props.items)) {
            const rendered: RenderedItem = {
                title: definition.title,
                description: definition.description,
                value: null,
            };

            if (props.value && !props.isLoading) {
                rendered.value =
                    typeof definition.render === 'function'
                        ? definition.render(props.value)
                        : (props.value[definition.render] as string);
            } else if (props.isLoading) {
                if (definition.renderLoading) {
                    rendered.value = definition.renderLoading();
                }
                rendered.value = <SkeletonText length={definition.skeletonLength} />;
            }

            items.push(rendered);
        }

        return items;
    });

    return (
        <div class={styles.list} classList={{ [styles.inset]: props.inset }}>
            <For each={renderedItems()}>
                {(item) => {
                    return (
                        <div class={styles.row}>
                            <div class={styles.property}>{item.title}</div>
                            <div class={styles.value}>{item.value}</div>
                        </div>
                    );
                }}
            </For>
        </div>
    );
}
