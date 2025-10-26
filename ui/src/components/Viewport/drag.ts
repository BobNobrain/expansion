import { useDrag } from '../../lib/solid/drag';

type UseDragOptions = {
    wrapper: () => HTMLDivElement;
};

type UseDragResult = {
    onMouseDown: (ev: MouseEvent) => void;
    onMouseUp: (ev: MouseEvent) => void;
};

export function useViewportMouseDrag({ wrapper }: UseDragOptions): UseDragResult {
    const dragStartScroll = { left: 0, top: 0 };

    const { handlers } = useDrag({
        onStart: () => {
            dragStartScroll.left = wrapper().scrollLeft;
            dragStartScroll.top = wrapper().scrollTop;
        },
        onDrag: (ev) => {
            const left = dragStartScroll.left - ev.total.x;
            const top = dragStartScroll.top - ev.total.y;
            wrapper().scroll({ left, top, behavior: 'instant' });
            console.log({ top, left, ev });
        },
    });

    return handlers;
}
