import { MeshBuilder } from '../../../lib/3d/MeshBuilder';
import { type RawVertex } from '../../../lib/3d/types';
import * as utils from './utils';

export function getInvertedMesh(source: MeshBuilder): MeshBuilder {
    const inverted = new MeshBuilder();
    const size = source.size();

    for (let fi = 0; fi < size.faces; fi++) {
        const face = source.face(fi);
        // const faceCenter = utils.normz(utils.calcCenter(face.map((vi) => source.coords(vi))));
        const normals = face.map((vi) => utils.normz(source.coords(vi)));
        const invertedFacesIntersection = intersectFacePlanes(normals[0], normals[1], normals[2]);
        inverted.add(...invertedFacesIntersection);
    }

    for (let vi = 0; vi < size.verticies; vi++) {
        const faces = source.findConnectedFaces([vi]);
        const v = source.coords(vi);
        const planeNormal = utils.normz(v);

        const normalizedProjections = faces.map((fi) => {
            const faceCenter = inverted.coords(fi);
            const projection = project(faceCenter, planeNormal);
            return utils.normz(projection);
        });

        const axis = normalizedProjections[0];

        const withAngles = faces.map((fi, i) => {
            if (i === 0) {
                return { fi, angle: 0, projection: axis };
            }

            const projection = normalizedProjections[i];
            const angle = fullAngle(projection, axis, planeNormal);

            return { fi, angle, projection };
        });
        withAngles.sort((a, b) => a.angle - b.angle);

        inverted.assembleVerticies(withAngles.map(({ fi }) => fi));
    }

    return inverted;
}

function project(v: RawVertex, planeNormal: RawVertex): RawVertex {
    return utils.diff(v, utils.mul(planeNormal, utils.dot(v, planeNormal)));
}

function fullAngle(v: RawVertex, axis: RawVertex, planeNormal: RawVertex): number {
    const cos = Math.max(-1, Math.min(utils.dot(v, axis), 1));
    const cross = utils.cross(axis, v);
    const sinAbs = Math.min(1, utils.size(cross));
    const sinSign = Math.sign(utils.dot(planeNormal, cross));
    const sin = sinAbs * sinSign;

    if (sin >= 0) {
        return Math.acos(cos);
    }
    if (cos >= 0) {
        return Math.asin(sin);
    }

    return Math.acos(Math.abs(cos)) - Math.PI;
}

/** Left to right, then top to bottom - like latin texts */
type RawMat = number[];

/**
 * Finds an intersection of 3 planes with normals n1, n2, n3, and tangent to unit sphere.
 * If, for some reason, no intersection is found, returns a normalized average of normals.
 */
function intersectFacePlanes(n1: RawVertex, n2: RawVertex, n3: RawVertex): RawVertex {
    const coeffs: RawMat = [...n1, ...n2, ...n3];
    const detA = det(coeffs);
    if (Math.abs(detA) < 1e-6) {
        console.log(`intersectFacePlanes: detA is too small: ${detA.toExponential(3)}`);
        return utils.normz(utils.calcCenter([n1, n2, n3]));
    }

    const cx = coeffs.slice();
    const cy = coeffs.slice();
    const cz = coeffs.slice();
    cx[0] = 1;
    cy[1] = 1;
    cz[2] = 1;
    cx[3] = 1;
    cy[4] = 1;
    cz[5] = 1;
    cx[6] = 1;
    cy[7] = 1;
    cz[8] = 1;
    const detx = det(cx);
    const dety = det(cy);
    const detz = det(cz);
    return [detx / detA, dety / detA, detz / detA];
}

function det(mat: RawMat): number {
    const [x11, x12, x13, x21, x22, x23, x31, x32, x33] = mat;
    return x11 * x22 * x33 + x12 * x23 * x31 + x21 * x32 * x13 - x31 * x22 * x13 - x21 * x12 * x33 - x32 * x23 * x11;
}
