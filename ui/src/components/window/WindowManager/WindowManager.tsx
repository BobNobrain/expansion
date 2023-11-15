import { For, type Component } from 'solid-js';
import styles from './WindowManager.module.css';
import { type WindowManagerController, createWindowManagerController } from '../controllers';
import { createBoundsTracker } from '../../../lib/solid/BoundsTracker';
import { Window } from '../Window/Window';

export interface WindowManagerProps {
    mode?: 'static' | 'fixed';
    onController?: (c: WindowManagerController) => void;
}

export const WindowManager: Component<WindowManagerProps> = (props) => {
    const wrapper = createBoundsTracker<HTMLDivElement>();

    const controller = createWindowManagerController({
        getSize: () => {
            const { width, height } = wrapper.getBounds();
            return { width, height };
        },
    });
    props.onController?.(controller);

    return (
        <div
            ref={wrapper.ref}
            classList={{
                [styles.wm]: true,
                [styles[props.mode ?? 'static']]: true,
            }}
        >
            <For each={controller.getWindows()}>
                {(windowController) => {
                    const Content = windowController.getContent();
                    return (
                        <Window controller={windowController}>
                            <Content />
                        </Window>
                    );
                }}
            </For>
        </div>
    );
};
