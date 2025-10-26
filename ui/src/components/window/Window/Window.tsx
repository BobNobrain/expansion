import { type ParentProps, type Component, type JSX, createMemo, Show } from 'solid-js';
import { Button } from '@/atoms';
import { useDrag } from '@/lib/solid/drag';
import { type WindowController } from '../controllers';
import { WindowState } from '../types';
import { useWindowResizers } from './resizeDrags';
import styles from './Window.module.css';

export interface WindowProps extends ParentProps {
    controller: WindowController;
}

export const Window: Component<WindowProps> = (props) => {
    const windowCss = createMemo<JSX.CSSProperties>(() => {
        const pos = props.controller.getPosition();
        return {
            left: pos.x + 'px',
            top: pos.y + 'px',
            width: pos.width + 'px',
            height: pos.height + 'px',
        };
    });

    const isResizeEnabled = () => props.controller.getWindowState() !== WindowState.Minimized;

    const titleDrag = useDrag({
        onDrag(ev) {
            props.controller.updatePosition((pos) => ({
                ...pos,
                x: pos.x + ev.last.x,
                y: pos.y + ev.last.y,
            }));
        },
    });

    const { topEdge, bottomEdge, leftEdge, rightEdge } = useWindowResizers({
        isResizeEnabled,
        controller: () => props.controller,
    });

    const onMinimizeClick = () => {
        props.controller.setMinimized((old) => !old);
    };
    const close = () => props.controller.close();

    return (
        <div
            class={styles.window}
            classList={{
                [styles.minimized]: props.controller.getWindowState() === WindowState.Minimized,
            }}
            style={windowCss()}
        >
            <div class={styles.dragLT} />
            <div class={styles.dragT} {...topEdge.handlers} />
            <div class={styles.dragRT} />
            <div class={styles.dragL} {...leftEdge.handlers} />
            <div class={styles.inner}>
                <header class={styles.header} {...titleDrag.handlers}>
                    <div
                        class={styles.title}
                        classList={{
                            [styles.dragging]: titleDrag.isDragging(),
                        }}
                    >
                        {props.controller.getTitle().text}
                    </div>
                    <div class={styles.controls}>
                        <Button onClick={onMinimizeClick}>_</Button>
                        <Button onClick={close}>X</Button>
                    </div>
                </header>
                <Show when={props.controller.getWindowState() !== WindowState.Minimized}>
                    <section class={styles.content}>{props.children}</section>
                    <footer class={styles.footer}>
                        <div class={styles.footerSpacer} />
                        <Button>Cancel</Button>
                        <Button loading>Wait a minute...</Button>
                        <Button color="primary" loading>
                            OK!
                        </Button>
                    </footer>
                </Show>
            </div>
            <div class={styles.dragR} {...rightEdge.handlers} />
            <div class={styles.dragLB} />
            <div class={styles.dragB} {...bottomEdge.handlers} />
            <div class={styles.dragRB} />
        </div>
    );
};
