import * as T from 'three';
import { type RawFace, type RawVertex, type Poly } from './types';

const areClose = (a: RawVertex, b: RawVertex, eps: number) => {
    const ds = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    for (const d of ds) {
        if (Math.abs(d) > eps) {
            return false;
        }
    }
    return true;
};

export class MeshBuilder {
    private verticies: RawVertex[] = [];
    private faces: Poly[] = [];

    private eps = 1e-3;
    setEps(eps: number) {
        this.eps = eps;
    }

    add(x: number, y: number, z: number): number {
        const i = this.verticies.length;
        this.verticies.push([x, y, z]);
        return i;
    }
    addMany(vs: RawVertex[]): number {
        const i = this.verticies.length;
        this.verticies.push(...vs);
        return i;
    }

    coords(vertexIndex: number): RawVertex {
        return this.verticies[vertexIndex];
    }

    lookup(x: number, y: number, z: number): number {
        const target: RawVertex = [x, y, z];
        for (let i = 0; i < this.verticies.length; i++) {
            const v = this.verticies[i];
            if (areClose(target, v, this.eps)) {
                return i;
            }
        }
        return -1;
    }

    assembleVerticies(vs: number[]): number {
        const i = this.faces.length;
        this.faces.push(vs);
        return i;
    }

    subdivide(f: (face: Poly, b: MeshBuilder) => Poly[]) {
        const newFaces: Poly[] = [];
        for (const face of this.faces) {
            const subs = f(face, this);
            newFaces.push(...subs);
        }
        this.faces = newFaces;
    }

    mapVerticies(f: (v: RawVertex, i: number) => RawVertex) {
        this.verticies = this.verticies.map(f);
    }

    build(): T.BufferGeometry {
        const faces: RawFace[] = [];
        for (const poly of this.faces) {
            if (poly.length === 3) {
                faces.push(poly as RawFace);
                continue;
            }

            const triangles = triangulatePoly(poly);
            for (const t of triangles) {
                faces.push(t);
            }
        }

        const geometry = new T.BufferGeometry();
        geometry.setAttribute('position', new T.BufferAttribute(new Float32Array(this.verticies.flat()), 3));
        geometry.setIndex(faces.flat());
        geometry.computeVertexNormals();

        return geometry;
    }
}

function triangulatePoly([anchor, ...vs]: number[]): RawFace[] {
    const result: RawFace[] = [];
    for (let i = 1; i < vs.length; i++) {
        result.push([anchor, vs[i - 1], vs[i]]);
    }
    return result;
}
