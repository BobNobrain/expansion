import { onCleanup, onMount } from 'solid-js';
import { type Mesh, Raycaster, Vector2 } from 'three';
import { type TapGestureData } from '@/lib/gestures/types';
import { useEventListener } from '@/lib/solid/useEventListener';
import { useSceneRenderer } from '@/three/context';

export type UseTileSelectorOptions = {
    onTileClick?: (index: number | undefined) => void;
    surfaceMesh: () => Mesh | null;
    faceIndexMap: () => Record<number, number>;
};

export function useTileSelector(props: UseTileSelectorOptions) {
    const { canvas, getBounds, getMainCamera, gestures } = useSceneRenderer();
    const raycaster = new Raycaster();

    const handleClick = (ev: MouseEvent | TapGestureData) => {
        const cam = getMainCamera();
        if (!cam) {
            return;
        }

        const mesh = props.surfaceMesh();
        if (!mesh) {
            return;
        }

        const { width, height, x, y } = getBounds();
        const pointer =
            'client' in ev
                ? new Vector2(((ev.client.x - x) / width) * 2 - 1, 1 - ((ev.client.y - y) / height) * 2)
                : new Vector2((ev.offsetX / width) * 2 - 1, 1 - (ev.offsetY / height) * 2);

        raycaster.setFromCamera(pointer, cam);

        const [closestIntersection] = raycaster.intersectObject(mesh);

        if (!closestIntersection) {
            props.onTileClick?.(undefined);
            return;
        }

        const triangleIndex = closestIntersection.faceIndex ?? -1;
        const originalFaceIndex = props.faceIndexMap()[triangleIndex] ?? -1;

        if (originalFaceIndex === -1) {
            props.onTileClick?.(undefined);
            return;
        }

        props.onTileClick?.(originalFaceIndex);
    };

    onMount(() => {
        const c = canvas();

        c.addEventListener('click', handleClick);
        onCleanup(() => c.removeEventListener('click', handleClick));
    });

    useEventListener(gestures.tap, handleClick);
}
