import { type Component, onMount, onCleanup, createEffect } from 'solid-js';
import * as T from 'three';
import { type UISceneConstructor } from '../../lib/3d/types';
import { createBoundsTracker } from '../../lib/solid/BoundsTracker';
import styles from './SceneRenderer.module.css';

export type GLViewportProps = {
    scene: UISceneConstructor;
};

export const SceneRenderer: Component<GLViewportProps> = (props) => {
    let canvas!: HTMLCanvasElement;
    const { getBounds, ref: wrapperRef } = createBoundsTracker<HTMLDivElement>();

    onMount(() => {
        if (!canvas) {
            return;
        }

        const renderer = new T.WebGLRenderer({
            canvas,
        });
        renderer.setClearColor(0x101010, 1);

        const scene = props.scene({ renderer, canvas });

        let active = true;
        let lastTime = -1;

        if (scene.onAnimationFrame) {
            const animate = (time: DOMHighResTimeStamp) => {
                if (!active) {
                    return;
                }

                const dt = lastTime === -1 ? 0 : time;
                lastTime = time;

                scene.onAnimationFrame!({ time, dt, renderer, canvas });
                requestAnimationFrame(animate);

                renderer.render(scene.scene, scene.mainCamera);
            };

            requestAnimationFrame(animate);
        } else {
            renderer.render(scene.scene, scene.mainCamera);
        }

        if (scene.onCanvasResize) {
            createEffect(() => {
                const newBounds = getBounds();
                renderer.setSize(newBounds.width, newBounds.height);
                scene.onCanvasResize!({
                    canvas,
                    newSize: {
                        width: newBounds.width,
                        height: newBounds.height,
                    },
                    renderer,
                });
            });
        }

        onCleanup(() => {
            active = false;
            scene.onDestroy?.();
            renderer.dispose();
        });
    });

    return (
        <div ref={wrapperRef} class={styles.wrapper}>
            <canvas class={styles.canvas} ref={canvas} />
        </div>
    );
};
