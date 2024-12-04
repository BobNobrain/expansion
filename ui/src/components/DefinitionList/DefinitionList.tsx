import { createMemo, For, type JSX } from 'solid-js';
import styles from './DefinitionList.module.css';

export type DefinitionListItem<V> = {
    title: string;
    description?: string;
    render: ((value: V) => JSX.Element | null) | keyof V;
    renderLoading?: () => JSX.Element;
};

export type DefinitionListProperties<V> = Record<keyof V, DefinitionListItem<V>>;

export type DefinitionListProps<V extends Record<string, unknown>> = {
    items: DefinitionListProperties<V>;
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
        for (const key of Object.keys(props.items) as (keyof V)[]) {
            const definition = props.items[key];
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
                rendered.value = null; // TODO: skeleton
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
