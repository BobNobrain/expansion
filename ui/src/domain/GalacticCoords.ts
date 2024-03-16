import { type RawVertex } from '../lib/3d/types';
import { Point2D } from '../lib/math/2d';

export type GalacticCoords = {
    r: number;
    theta: number;
    h: number;
};

export namespace GalacticCoords {
    export function fromXYZ(x: number, y: number, z: number): GalacticCoords {
        const r = Math.sqrt(x * x + z * z);
        const angle = Point2D.angle({ x: 1, y: 0 }, { x, y: z });
        return {
            r,
            theta: angle,
            h: y,
        };
    }

    export function toXYZ(coords: GalacticCoords): RawVertex {
        const x = coords.r * Math.cos(coords.theta);
        const z = coords.r * Math.sin(coords.theta);
        return [x, coords.h, z];
    }
}
