import { type Component, createMemo, type JSX } from 'solid-js';
import { useLocation } from '@solidjs/router';

export type RouteMatcherProps<T> = {
    endsWith?: string;
    component: Component<T>;
    props?: T;
};

export function RouteMatcher<T>(props: RouteMatcherProps<T>) {
    const location = useLocation();

    return createMemo(() => {
        if (props.endsWith !== undefined && location.pathname.endsWith(props.endsWith)) {
            return <props.component {...props.props!} />;
        }

        return null;
    }) as never as JSX.Element;
}
