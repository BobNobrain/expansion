import { Raycaster, Vector2 } from 'three';
import { type Point2D } from '@/lib/math/2d';
import { useSceneRenderer } from '../context';

export type UseRaycasterResult = {
    setFromClient: (clientCoords: Point2D) => Raycaster;
};

export function useRaycaster(raycaster = new Raycaster()): UseRaycasterResult {
    const { getBounds, getMainCamera } = useSceneRenderer();

    return {
        setFromClient: (clientCoords) => {
            const { x, y, width, height } = getBounds();
            const cam = getMainCamera();
            if (cam) {
                const pointer = new Vector2(
                    ((clientCoords.x - x) / width) * 2 - 1,
                    1 - ((clientCoords.y - y) / height) * 2,
                );
                raycaster.setFromCamera(pointer, cam);
            }

            return raycaster;
        },
    };
}
