import { Point2D } from '../lib/math/2d';

export type GalacticGridSector = {
    id: string;
    innerR: number;
    outerR: number;
    thetaStart: number;
    thetaEnd: number;
};

export namespace GalacticGridSector {
    export function contains(sector: GalacticGridSector, point: GalacticCoords): boolean {
        const hasR = sector.innerR <= point.r && point.r < sector.outerR;
        if (!hasR) {
            return false;
        }

        const hasTheta = sector.thetaStart <= point.theta && point.theta < sector.thetaEnd;
        if (hasTheta) {
            return true;
        }

        const theta1 = point.theta + 2 * Math.PI;
        return sector.thetaStart <= theta1 && theta1 < sector.thetaEnd;
    }
}

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
}

export type GalacticGrid = {
    innerR: number;
    outerR: number;
    maxH: number;
    sectors: GalacticGridSector[];
};

export namespace GalacticGrid {
    export function findContainingSector(grid: GalacticGrid, point: GalacticCoords): GalacticGridSector | null {
        for (const s of grid.sectors) {
            if (GalacticGridSector.contains(s, point)) {
                return s;
            }
        }
        return null;
    }
}
