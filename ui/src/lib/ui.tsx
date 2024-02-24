import { type Component } from 'solid-js';
import { render } from 'solid-js/web';

interface RunUIOptions {
    title: string;
}

export function runUI(UI: Component, opts: RunUIOptions) {
    document.title = opts.title;

    render(() => <UI />, document.getElementById('app')!);
}
