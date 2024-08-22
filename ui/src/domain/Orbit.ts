import { type RawVertex } from '../lib/3d/types';

export type Orbit = {
    bodyId: string;
    aroundId: string | null;
    semiMajorAu: number;
    eccentricity: number;
    rotation: number;
    inclination: number;
    timeAtPeriapsis: Date;
};

export namespace Orbit {
    export function calcSemiMinorAu(orbit: Orbit): number {
        return orbit.semiMajorAu * Math.sqrt(1 - orbit.eccentricity * orbit.eccentricity);
    }

    export function calcApoapsisAu(orbit: Orbit): number {
        return orbit.semiMajorAu * (1 + orbit.eccentricity);
    }

    export function calcPeriapsisAu(orbit: Orbit): number {
        return orbit.semiMajorAu * (1 - orbit.eccentricity);
    }

    export function coordsFromTrueAnomaly(orbit: Orbit, theta: number): RawVertex {
        const { semiMajorAu: semimajor, eccentricity: e, inclination: incl, rotation: rot } = orbit;
        const numerator = semimajor * (1 - e * e);
        const sinRot = Math.sin(rot);
        const cosRot = Math.cos(rot);
        const sinIncl = Math.sin(incl);
        const cosIncl = Math.cos(incl);

        const denominator = 1 + e * Math.cos(theta);
        const r = numerator / denominator;

        const inPlane: RawVertex = [r * -Math.cos(theta), 0, r * -Math.sin(theta)];
        const rotatedAroundZ: RawVertex = [
            inPlane[0] * cosIncl - inPlane[1] * sinIncl,
            inPlane[0] * sinIncl + inPlane[1] * cosIncl,
            inPlane[2],
        ];

        const rotatedAroundY: RawVertex = [
            rotatedAroundZ[0] * cosRot + rotatedAroundZ[2] * sinRot,
            rotatedAroundZ[1],
            -rotatedAroundZ[0] * sinRot + rotatedAroundZ[2] * cosRot,
        ];

        return rotatedAroundY;
    }

    export function coordsFromTrueAnomalies(orbit: Orbit, thetas: Iterable<number>): RawVertex[] {
        const { semiMajorAu: semimajor, eccentricity: e, inclination: incl, rotation: rot } = orbit;
        const numerator = semimajor * (1 - e * e);
        const sinRot = Math.sin(rot);
        const cosRot = Math.cos(rot);
        const sinIncl = Math.sin(incl);
        const cosIncl = Math.cos(incl);

        const results: RawVertex[] = [];
        for (const theta of thetas) {
            const denominator = 1 + e * Math.cos(theta);
            const r = numerator / denominator;

            const inPlane: RawVertex = [r * -Math.cos(theta), 0, r * -Math.sin(theta)];
            const rotatedAroundZ: RawVertex = [
                inPlane[0] * cosIncl - inPlane[1] * sinIncl,
                inPlane[0] * sinIncl + inPlane[1] * cosIncl,
                inPlane[2],
            ];

            const rotatedAroundY: RawVertex = [
                rotatedAroundZ[0] * cosRot + rotatedAroundZ[2] * sinRot,
                rotatedAroundZ[1],
                -rotatedAroundZ[0] * sinRot + rotatedAroundZ[2] * cosRot,
            ];

            results.push(rotatedAroundY);
        }

        return results;
    }

    // export function calculatePeriod(orbit: Orbit, sumMasses: number): number {}
}
