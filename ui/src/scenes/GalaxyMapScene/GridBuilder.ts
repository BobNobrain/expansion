import { GalacticCoords } from '../../domain/GalacticCoords';
import { type GalacticGrid, type GalacticGridSector } from '../../domain/GalacticOverview';
import { type RawVertex } from '../../lib/3d/types';
import { FULL_CIRCLE, SEGMENT_LENGTH } from './constants';

function captureGridTheta(thetas: number[], targetTheta: number): [number, number] {
    let is = 0;
    let ie = thetas.length - 1;

    while (targetTheta >= FULL_CIRCLE) {
        targetTheta -= FULL_CIRCLE;
    }

    while (ie - is > 1) {
        const im = Math.floor((ie + is) / 2);
        const thm = thetas[im];
        if (thm < targetTheta) {
            is = im;
        } else {
            ie = im;
        }
    }
    return [is, ie];
}
function getThetasBetween(thetas: number[], thetaStart: number, thetaEnd: number): number[] {
    const [, afterStart] = captureGridTheta(thetas, thetaStart);
    const [beforeEnd] = captureGridTheta(thetas, thetaEnd);
    if (afterStart <= beforeEnd) {
        return thetas.slice(afterStart, beforeEnd + 1);
    }

    // 0 [ . .e. . . . .s. ] 2PI
    return [
        ...thetas.slice(afterStart, thetas.length),
        ...thetas.slice(0, beforeEnd + 1).map((th) => th + FULL_CIRCLE),
    ];
}

export class GridBuilder {
    private thetasByR = new Map<number, number[]>();
    private rScale: number;

    constructor(grid: GalacticGrid) {
        this.rScale = (grid.outerR - grid.innerR) / grid.sectors.length;

        for (const sector of grid.sectors) {
            const roundedInner = this.round(sector.innerR);
            const roundedOuter = this.round(sector.outerR);

            this.getThetas(roundedInner);
            this.getThetas(roundedOuter);
        }
    }

    getVerticiesOf(sector: GalacticGridSector): RawVertex[] {
        const points: RawVertex[] = [];

        const innerR = this.round(sector.innerR);
        const outerR = this.round(sector.outerR);
        const { thetaStart, thetaEnd } = sector;

        // inner
        const innerCircle = this.getThetas(innerR);
        points.push(GalacticCoords.toXYZ({ r: innerR, theta: thetaStart, h: 0 }));
        for (const th of getThetasBetween(innerCircle, thetaStart, thetaEnd)) {
            if (th === thetaStart || th === thetaEnd) {
                continue;
            }
            points.push(GalacticCoords.toXYZ({ r: innerR, theta: th, h: 0 }));
        }
        points.push(GalacticCoords.toXYZ({ r: innerR, theta: thetaEnd, h: 0 }));

        // outer
        const outerCircle = this.getThetas(outerR);
        points.push(GalacticCoords.toXYZ({ r: outerR, theta: thetaEnd, h: 0 }));
        for (const th of getThetasBetween(outerCircle, thetaStart, thetaEnd).reverse()) {
            if (th === thetaStart || th === thetaEnd) {
                continue;
            }
            points.push(GalacticCoords.toXYZ({ r: outerR, theta: th, h: 0 }));
        }
        points.push(GalacticCoords.toXYZ({ r: outerR, theta: thetaStart, h: 0 }));

        points.push(points[0]); // close the shape
        return points;
    }

    private round(r: number): number {
        return Math.floor(r / this.rScale) * this.rScale;
    }

    private getThetas(roundedR: number): number[] {
        const cached = this.thetasByR.get(roundedR);
        if (cached) {
            return cached;
        }

        const thetas: number[] = [];
        const dth = SEGMENT_LENGTH / (FULL_CIRCLE * roundedR);

        for (let th = 0; th < FULL_CIRCLE; th += dth) {
            thetas.push(th);
        }

        this.thetasByR.set(roundedR, thetas);
        return thetas;
    }
}
