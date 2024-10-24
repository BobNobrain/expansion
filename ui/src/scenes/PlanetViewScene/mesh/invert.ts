import { MeshBuilder } from '../../../lib/3d/MeshBuilder';
import { type RawVertex } from '../../../lib/3d/types';
import * as utils from './utils';

export function getInvertedMesh(source: MeshBuilder): MeshBuilder {
    const inverted = new MeshBuilder();
    const size = source.size();

    for (let fi = 0; fi < size.faces; fi++) {
        const face = source.face(fi);
        const faceCenter = utils.normz(utils.calcCenter(face.map((vi) => source.coords(vi))));
        inverted.add(...faceCenter);
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
