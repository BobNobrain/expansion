import { onCleanup } from 'solid-js';
import type { EditorController } from './types';

export function useController(
    props: {
        controller?: (v: EditorController | null) => void;
    },
    ctrl: EditorController,
) {
    props.controller?.(ctrl);
    onCleanup(() => {
        props.controller?.(null);
    });
}
