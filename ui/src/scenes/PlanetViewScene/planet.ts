import * as T from 'three';
import { MeshBuilder } from '../../lib/3d/MeshBuilder';
import { type Poly, type RawVertex } from '../../lib/3d/types';

export function createCustomMesh(): T.Mesh {
    const material = new T.MeshStandardMaterial({
        color: 0x2080f0,
        roughness: 0.6,
        metalness: 0.3,
        flatShading: true,
        // wireframe: true,
    });

    const geom = createPlanetGeometry();
    return new T.Mesh(geom, material);
}

function createPlanetGeometry(): T.BufferGeometry {
    const SIZE = 1;

    // return cube(SIZE);
    return icosahedron(SIZE);
}

export function icosahedron(size: number) {
    const phi = (1.0 + Math.sqrt(5.0)) / 2.0;
    const du = size / Math.sqrt(phi * phi + 1.0);
    const dv = phi * du;

    const builder = new MeshBuilder();
    builder.addMany([
        [0, +dv, +du],
        [0, +dv, -du],
        [0, -dv, +du],
        [0, -dv, -du],
        [+du, 0, +dv],
        [-du, 0, +dv],
        [+du, 0, -dv],
        [-du, 0, -dv],
        [+dv, +du, 0],
        [+dv, -du, 0],
        [-dv, +du, 0],
        [-dv, -du, 0],
    ]);

    builder.assembleVerticies([8, 1, 0]);
    builder.assembleVerticies([5, 4, 0]);
    builder.assembleVerticies([10, 5, 0]);
    builder.assembleVerticies([4, 8, 0]);
    builder.assembleVerticies([1, 10, 0]);
    builder.assembleVerticies([8, 6, 1]);
    builder.assembleVerticies([6, 7, 1]);
    builder.assembleVerticies([7, 10, 1]);
    builder.assembleVerticies([11, 3, 2]);
    builder.assembleVerticies([9, 4, 2]);
    builder.assembleVerticies([4, 5, 2]);
    builder.assembleVerticies([3, 9, 2]);
    builder.assembleVerticies([5, 11, 2]);
    builder.assembleVerticies([7, 6, 3]);
    builder.assembleVerticies([11, 7, 3]);
    builder.assembleVerticies([6, 9, 3]);
    builder.assembleVerticies([9, 8, 4]);
    builder.assembleVerticies([10, 11, 5]);
    builder.assembleVerticies([8, 9, 6]);
    builder.assembleVerticies([11, 10, 7]);

    builder.subdivide(subdivideTriangle);
    builder.subdivide(subdivideTriangle);
    builder.subdivide(subdivideTriangle);
    builder.mapVerticies(normz);
    builder.mapVerticies(scale(size));

    return builder.build();
}

export function cube(size: number) {
    const builder = new MeshBuilder();
    // corner left|right bottom|top rear|front
    const clbr = builder.add(-size, -size, -size);
    const crbr = builder.add(size, -size, -size);
    const clbf = builder.add(-size, -size, size);
    const crbf = builder.add(size, -size, size);
    const cltr = builder.add(-size, size, -size);
    const cltf = builder.add(-size, size, size);
    const crtr = builder.add(size, size, -size);
    const crtf = builder.add(size, size, size);

    // rear
    builder.assembleVerticies([clbr, cltr, crtr, crbr]);
    // top
    builder.assembleVerticies([crtr, cltr, cltf, crtf]);
    // right
    builder.assembleVerticies([crbr, crtr, crtf, crbf]);
    // left
    builder.assembleVerticies([clbr, clbf, cltf, cltr]);
    // bottom
    builder.assembleVerticies([clbf, clbr, crbr, crbf]);
    // front
    builder.assembleVerticies([crtf, cltf, clbf, crbf]);

    builder.subdivide(subdivideCubeSide);
    builder.subdivide(subdivideCubeSide);
    builder.mapVerticies(normz);
    builder.mapVerticies(scale(size));

    return builder.build();
}

function calcCenter(vs: RawVertex[]): RawVertex {
    let x = 0;
    let y = 0;
    let z = 0;
    for (const v of vs) {
        x += v[0];
        y += v[1];
        z += v[2];
    }
    return [x / vs.length, y / vs.length, z / vs.length];
}

function normz(v: RawVertex): RawVertex {
    const [x, y, z] = v;
    const d = Math.sqrt(x * x + y * y + z * z);
    return [x / d, y / d, z / d];
}
function scale(size: number): (v: RawVertex) => RawVertex {
    return ([x, y, z]) => [x * size, y * size, z * size];
}

function subdivideCubeSide(side: Poly, builder: MeshBuilder): Poly[] {
    const coords = side.map((i) => builder.coords(i));
    const centerCoords = calcCenter(coords);
    const [topLeftCoords, topRightCoords, bottomRightCoords, bottomLeftCoords] = coords;

    const center = builder.add(...centerCoords);
    const top = builder.add(...calcCenter([topLeftCoords, topRightCoords]));
    const right = builder.add(...calcCenter([topRightCoords, bottomRightCoords]));
    const bottom = builder.add(...calcCenter([bottomLeftCoords, bottomRightCoords]));
    const left = builder.add(...calcCenter([topLeftCoords, bottomLeftCoords]));
    const [topLeft, topRight, bottomRight, bottomLeft] = side;

    const quarters: Poly[] = [
        [topLeft, top, center, left],
        [top, topRight, right, center],
        [center, right, bottomRight, bottom],
        [left, center, bottom, bottomLeft],
    ];
    return quarters;
}

function subdivideTriangle(triangle: Poly, builder: MeshBuilder): Poly[] {
    const coords = triangle.map((i) => builder.coords(i));
    const middleCoords = [
        calcCenter([coords[0], coords[1]]),
        calcCenter([coords[1], coords[2]]),
        calcCenter([coords[2], coords[0]]),
    ];

    const middles = middleCoords.map((c) => builder.add(...c));

    return [
        [middles[2], triangle[0], middles[0]],
        [middles[0], triangle[1], middles[1]],
        [middles[1], triangle[2], middles[2]],
        middles,
    ];
}
