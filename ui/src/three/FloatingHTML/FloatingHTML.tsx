import { createMemo, createSignal, type JSX, type ParentComponent } from 'solid-js';
import * as T from 'three';
import { useSceneRenderer } from '../context';
import { useAnimation } from '../hooks/useAnimation';
import styles from './FloatingHTML.module.css';

export type FloatingHTMLProps = {
    x: number;
    y: number;
    z: number;
    normal?: {
        x: number;
        y: number;
        z: number;
    };
};

const EPS = 1e-2;
const eq = (a: number, b: number) => Math.abs(a - b) < EPS;

export const FloatingHTML: ParentComponent<FloatingHTMLProps> = (props) => {
    const { getMainCamera, getBounds } = useSceneRenderer();
    const [getPosition, setPosition] = createSignal({ x: 0, y: 0 });
    const [getRotation, _setRotation] = createSignal<{ x: number; y: number; z: number; angle: number } | null>(null);

    useAnimation(() => {
        const cam = getMainCamera();
        if (!cam) {
            return;
        }

        const normalized = new T.Vector3(props.x, props.y, props.z).project(cam);
        const { width, height } = getBounds();

        const newPosition = {
            x: ((normalized.x + 1) / 2) * width,
            y: ((1 - normalized.y) / 2) * height,
        };

        setPosition((prev) => {
            if (eq(prev.x, newPosition.x) && eq(prev.y, newPosition.y)) {
                return prev;
            }

            return newPosition;
        });

        if (!props.normal) {
            return;
        }

        // TODO: implement the rotation part
    });

    const style = createMemo<JSX.CSSProperties>(() => {
        const { x, y } = getPosition();
        const result: JSX.CSSProperties = {
            left: x + 'px',
            top: y + 'px',
        };

        const rotation = getRotation();
        if (rotation) {
            const { angle, ...axis } = rotation;
            result.transform = `rotate3d(${axis.x}, ${axis.y}, ${axis.z}, ${angle}rad)`;
        }

        return result;
    });

    return (
        <div class={styles.wrapper} classList={{ [styles.hidden]: !getMainCamera() }} style={style()}>
            {props.children}
        </div>
    );
};
