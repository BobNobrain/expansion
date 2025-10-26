import { type Component, createMemo } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export type TabContentProps<T extends PropertyKey> = {
    active: T;
    components: Record<T, Component>;
    fallback?: Component;
};

export function TabContent<T extends PropertyKey>(props: TabContentProps<T>) {
    const component = createMemo<Component>(() => props.components[props.active] ?? props.fallback);

    return <Dynamic component={component()} />;
}
