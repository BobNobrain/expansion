import { type Point2D } from '../../lib/math/2d';
import { lerp } from '../../lib/math/misc';
import {
    FULL_CIRCLE,
    INNER_R,
    MIN_SECTORS,
    N_CIRCLES,
    N_RINGS,
    N_STARS,
    OUTER_R,
    SECTORS_INCREMENT,
    SEGMENT_LENGTH,
} from './constants';

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
function* getSectorNames() {
    const used = new Set<string>();
    while (true) {
        const r1 = Math.floor(Math.random() * LETTERS.length);
        const r2 = Math.floor(Math.random() * LETTERS.length);
        if (r1 === r2) {
            continue;
        }

        const candidate = LETTERS[r1] + LETTERS[r2];
        if (used.has(candidate)) {
            continue;
        }

        used.add(candidate);
        yield candidate;
    }
}

type Circle = {
    r: number;
    thetas: number[];
};

type Ring = {
    innerCircle: number;
    outerCircle: number;
    nSectors: number;
    sectorStart: number;
};

function subdivideCircle(r: number): number[] {
    if (r <= 0) {
        throw new Error('r<=0');
    }
    const thetas: number[] = [];
    const dth = SEGMENT_LENGTH / (FULL_CIRCLE * r);

    for (let th = 0; th < FULL_CIRCLE; th += dth) {
        thetas.push(th);
    }

    return thetas;
}

const circles = new Array(N_CIRCLES).fill(null).map((_, i): Circle => {
    const progress = i / N_RINGS;

    const adjustedProgress = (Math.exp(progress) - 1) / (Math.E - 1);

    const r = lerp(INNER_R, OUTER_R, adjustedProgress);
    return {
        r,
        thetas: subdivideCircle(r),
    };
});

const rings = new Array(N_RINGS).fill(null).map((_, i): Ring => {
    return {
        innerCircle: i,
        outerCircle: i + 1,
        nSectors: MIN_SECTORS + i * SECTORS_INCREMENT,
        sectorStart: (i * 3) % 7,
    };
});

function captureGridTheta(circle: Circle, targetTheta: number): [number, number] {
    let is = 0;
    let ie = circle.thetas.length - 1;

    while (targetTheta >= FULL_CIRCLE) {
        targetTheta -= FULL_CIRCLE;
    }

    while (ie - is > 1) {
        const im = Math.floor((ie + is) / 2);
        const thm = circle.thetas[im];
        if (thm < targetTheta) {
            is = im;
        } else {
            ie = im;
        }
    }
    return [is, ie];
}
function getThetasBetween(circle: Circle, thetaStart: number, thetaEnd: number): number[] {
    const [, afterStart] = captureGridTheta(circle, thetaStart);
    const [beforeEnd] = captureGridTheta(circle, thetaEnd);
    if (afterStart <= beforeEnd) {
        return circle.thetas.slice(afterStart, beforeEnd + 1);
    }

    // 0 [ . .e. . . . .s. ] 2PI
    return [
        ...circle.thetas.slice(afterStart, circle.thetas.length),
        ...circle.thetas.slice(0, beforeEnd + 1).map((th) => th + FULL_CIRCLE),
    ];
}

function toPoint(r: number, theta: number): Point2D {
    return {
        x: r * Math.cos(theta),
        y: r * Math.sin(theta),
    };
}

export type GalaxySectors = {
    sectors: Sector[];
};

export type Sector = {
    name: string;
    points: Point2D[];
    innerR: number;
    outerR: number;
    thetaStart: number;
    thetaEnd: number;
};

export function divideGalaxy(): GalaxySectors {
    const sectors: Sector[] = [];
    console.log({ circles, rings });
    const nameASector = getSectorNames();

    for (let ri = 0; ri < rings.length; ri++) {
        const ring = rings[ri];
        const innerCircle = circles[ring.innerCircle];
        const outerCircle = circles[ring.outerCircle];
        const sectorLength = FULL_CIRCLE / ring.nSectors;
        let theta = (ring.sectorStart * sectorLength) / 7;

        for (let si = 0; si < ring.nSectors; si++) {
            const thetaStart = theta;
            const thetaEnd = theta + sectorLength;

            const s: Sector = {
                name: nameASector.next().value ?? '',
                innerR: innerCircle.r,
                outerR: outerCircle.r,
                points: [],
                thetaStart,
                thetaEnd,
            };
            sectors.push(s);

            // inner
            s.points.push(toPoint(innerCircle.r, thetaStart));
            for (const th of getThetasBetween(innerCircle, thetaStart, thetaEnd)) {
                if (th === thetaStart) {
                    continue;
                }
                s.points.push(toPoint(innerCircle.r, th));
            }
            s.points.push(toPoint(innerCircle.r, thetaEnd));

            // outer
            s.points.push(toPoint(outerCircle.r, thetaEnd));
            for (const th of getThetasBetween(outerCircle, thetaStart, thetaEnd).reverse()) {
                if (th === thetaStart) {
                    continue;
                }
                s.points.push(toPoint(outerCircle.r, th));
            }
            s.points.push(toPoint(outerCircle.r, thetaStart));

            s.points.push(s.points[0]); // close the shape

            theta += sectorLength;
        }
    }

    console.log('Total sectors:', sectors.length);
    console.log('Avg stars per sector:', N_STARS / sectors.length);

    return { sectors };
}

export function isInSector(sector: Sector, r: number, theta: number): boolean {
    if (r < sector.innerR || sector.outerR < r) {
        return false;
    }
    if (sector.thetaStart < theta && theta < sector.thetaEnd) {
        return true;
    }
    if (sector.thetaStart < theta + FULL_CIRCLE && theta + FULL_CIRCLE < sector.thetaEnd) {
        return true;
    }
    return false;
}

export function findSectorFor(sectors: Sector[], r: number, theta: number): Sector | null {
    for (const sector of sectors) {
        if (r < sector.innerR || sector.outerR < r) {
            continue;
        }
        if (sector.thetaStart < theta && theta < sector.thetaEnd) {
            return sector;
        }
        if (sector.thetaStart < theta + FULL_CIRCLE && theta + FULL_CIRCLE < sector.thetaEnd) {
            return sector;
        }
    }

    return null;
}
