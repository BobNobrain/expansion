import { onMount, onCleanup, createEffect, createSignal, type ParentComponent, untrack } from 'solid-js';
import { Scene, WebGLRenderer, type Camera, type ColorRepresentation } from 'three';
import { createBoundsTracker } from '../../../lib/solid/BoundsTracker';
import { createEvent } from '../../../lib/event';
import { SceneRendererContext } from '../context';
import { type AnimationFrameData } from '../types';
import styles from './SceneRenderer.module.css';
import { createTouchGestureManager } from '../../../lib/gestures/TouchGestureManager';

type SceneRendererProps = {
    clearColor?: ColorRepresentation;
};

export const SceneRenderer: ParentComponent<SceneRendererProps> = (props) => {
    let canvas!: HTMLCanvasElement;
    const { getBounds, ref: wrapperRef } = createBoundsTracker<HTMLDivElement>();

    const animation = createEvent<AnimationFrameData>();
    const scene = new Scene();
    let renderer: WebGLRenderer | null = null;
    const [getMainCamera, setMainCamera] = createSignal<Camera | null>(null);

    const gestures = createTouchGestureManager();

    onMount(() => {
        if (!canvas) {
            throw new Error('canvas ref is not set');
        }

        gestures.attach(canvas);

        renderer = new WebGLRenderer({
            canvas,
        });

        createEffect(() => {
            renderer!.setClearColor(props.clearColor ?? 0x101010, 1);
        });

        let active = true;
        let lastTime = -1;

        const animate = (time: DOMHighResTimeStamp) => {
            if (!active || !renderer) {
                return;
            }

            const cam = getMainCamera();
            if (!cam) {
                return;
            }

            const dt = lastTime === -1 ? 0 : time - lastTime;
            lastTime = time;

            if (animation.length()) {
                animation.trigger({ time, dt, renderer, canvas });
                renderer.render(scene, cam);
            }

            requestAnimationFrame(animate);
        };

        createEffect(() => {
            const newBounds = getBounds();
            renderer?.setSize(newBounds.width, newBounds.height);

            const cam = untrack(getMainCamera);
            if (cam && renderer) {
                renderer.render(scene, cam);
            }
        });

        createEffect(() => {
            const cam = getMainCamera();
            if (cam) {
                active = true;
                requestAnimationFrame(animate);
            } else {
                active = false;
            }
        });

        onCleanup(() => {
            active = false;
            setMainCamera(null);
            renderer?.dispose();
            gestures.destroy();
        });
    });

    const context: SceneRendererContext = {
        canvas: () => canvas,
        renderer: () => renderer,
        scene: () => scene,
        animation,
        getBounds,
        getMainCamera,
        setMainCamera,
        gestures,
    };

    return (
        <div ref={wrapperRef} class={styles.wrapper}>
            <canvas class={styles.canvas} ref={canvas} />
            <SceneRendererContext.Provider value={context}>{props.children}</SceneRendererContext.Provider>
        </div>
    );
};
