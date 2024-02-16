import { onMount, onCleanup, createEffect, createSignal, type ParentComponent } from 'solid-js';
import * as T from 'three';
import { createBoundsTracker } from '../../../lib/solid/BoundsTracker';
import { createEvent } from '../../../lib/event';
import { SceneRendererContext } from '../context';
import { type AnimationFrameData } from '../types';
import styles from './SceneRenderer.module.css';

type SceneRendererProps = {
    clearColor?: T.ColorRepresentation;
};

export const SceneRenderer: ParentComponent<SceneRendererProps> = (props) => {
    let canvas!: HTMLCanvasElement;
    const { getBounds, ref: wrapperRef } = createBoundsTracker<HTMLDivElement>();

    const animation = createEvent<AnimationFrameData>();
    const scene = new T.Scene();
    let renderer: T.WebGLRenderer | null = null;
    const [getMainCamera, setMainCamera] = createSignal<T.Camera | null>(null);

    onMount(() => {
        if (!canvas) {
            return;
        }

        renderer = new T.WebGLRenderer({
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

            const dt = lastTime === -1 ? 0 : time;
            lastTime = time;

            animation.trigger({ time, dt, renderer, canvas });

            renderer.render(scene, cam);

            requestAnimationFrame(animate);
        };

        createEffect(() => {
            const newBounds = getBounds();
            console.log('renderer.setSize', newBounds.width, newBounds.height);
            renderer?.setSize(newBounds.width, newBounds.height);
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
        });
    });

    const context: SceneRendererContext = {
        canvas: () => canvas,
        renderer: () => renderer,
        scene: () => scene,
        animation,
        getBounds,
        setMainCamera,
    };

    return (
        <div ref={wrapperRef} class={styles.wrapper}>
            <canvas class={styles.canvas} ref={canvas} />
            <SceneRendererContext.Provider value={context}>{props.children}</SceneRendererContext.Provider>
        </div>
    );
};