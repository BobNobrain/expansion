import * as T from 'three';
import { type RawFace, type RawVertex, type Poly, type RawColor } from './types';

const areClose = (a: RawVertex, b: RawVertex, eps: number) => {
    const ds = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
    for (const d of ds) {
        if (Math.abs(d) > eps) {
            return false;
        }
    }
    return true;
};

export type MeshBuilderSize = {
    verticies: number;
    faces: number;
};

export class MeshBuilder {
    private verticies: RawVertex[] = [];
    private colors: RawColor[] = [];
    private faces: Poly[] = [];

    size(): MeshBuilderSize {
        return {
            verticies: this.verticies.length,
            faces: this.faces.length,
        };
    }

    add(x: number, y: number, z: number): number {
        const i = this.verticies.length;
        this.verticies.push([x, y, z]);
        return i;
    }
    addIfNotClose(x: number, y: number, z: number): number {
        const i = this.lookup(x, y, z);
        return i === -1 ? this.add(x, y, z) : i;
    }
    addMany(vs: RawVertex[]): number {
        const i = this.verticies.length;
        this.verticies.push(...vs);
        return i;
    }

    coords(vertexIndex: number): RawVertex {
        return this.verticies[vertexIndex];
    }
    setCoords(vertexIndex: number, coords: RawVertex) {
        this.verticies[vertexIndex] = coords;
    }

    mapVerticies(f: (v: RawVertex, i: number) => RawVertex) {
        this.verticies = this.verticies.map(f);
    }

    calculateConnectionMap(): Set<number>[] {
        const result = this.verticies.map(() => new Set<number>());

        for (const face of this.faces) {
            result[face[0]].add(face[face.length - 1]);
            result[face[face.length - 1]].add(face[0]);

            for (let fvi = 1; fvi < face.length - 1; fvi++) {
                result[face[fvi]].add(face[fvi - 1]);
                result[face[fvi - 1]].add(face[fvi]);

                result[face[fvi]].add(face[fvi + 1]);
                result[face[fvi + 1]].add(face[fvi]);
            }
        }

        return result;
    }

    private eps = 1e-3;
    setEps(eps: number) {
        this.eps = eps;
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

    face(faceIndex: number): Poly {
        return this.faces[faceIndex];
    }
    findConnectedFaces(vertexIndicies: number[]): number[] {
        const result: number[] = [];
        for (let f = 0; f < this.faces.length; f++) {
            const face = this.faces[f];
            if (vertexIndicies.every((vi) => face.includes(vi))) {
                result.push(f);
            }
        }
        return result;
    }
    replaceFace(faceIndex: number, vs: number[]) {
        this.faces[faceIndex] = vs;
    }

    subdivide(f: (face: Poly, b: MeshBuilder) => Poly[]) {
        const newFaces: Poly[] = [];
        for (const face of this.faces) {
            const subs = f(face, this);
            newFaces.push(...subs);
        }
        this.faces = newFaces;
    }

    triangulate() {
        const triangulatedFaces: RawFace[] = [];
        for (const poly of this.faces) {
            if (poly.length === 3) {
                triangulatedFaces.push(poly as RawFace);
                continue;
            }

            const triangles = triangulatePoly(poly);
            for (const t of triangles) {
                triangulatedFaces.push(t);
            }
        }
        this.faces = triangulatedFaces;
    }

    paintFaces(palette: RawColor[], faceColors: number[]) {
        const vnOriginal = this.verticies.length;
        this.colors = new Array<RawColor>(vnOriginal);

        // duplicates[vi][ci] -> vi with color palette[ci] (or undefined, if none)
        const duplicates = new Array<number[]>(vnOriginal);

        for (let fi = 0; fi < this.faces.length; fi++) {
            const ci = faceColors[fi];
            const color = palette[ci];
            const face = this.faces[fi];

            for (let fvi = 0; fvi < face.length; fvi++) {
                const vi = face[fvi];
                if (!duplicates[vi]) {
                    duplicates[vi] = new Array<number>(palette.length);
                    duplicates[vi][ci] = vi;
                    this.colors[vi] = color;
                    continue;
                }

                if (!duplicates[vi][ci]) {
                    const dupedVi = this.add(...this.verticies[vi]);
                    duplicates[vi][ci] = dupedVi;
                    this.colors[dupedVi] = color;
                }

                face[fvi] = duplicates[vi][ci];
            }
        }
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

        if (this.colors.length) {
            const colorsAttr = new T.BufferAttribute(new Float32Array(this.colors.flat()), 3);
            geometry.setAttribute('color', colorsAttr);
            geometry.setAttribute('emissive', colorsAttr.clone());
        }

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
