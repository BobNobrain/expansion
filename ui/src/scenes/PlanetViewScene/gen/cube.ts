import { MeshBuilder } from '../../../lib/3d/MeshBuilder';
import { type Poly } from '../../../lib/3d/types';
import { calcCenter, normz, scale } from './utils';

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

    return builder;
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
