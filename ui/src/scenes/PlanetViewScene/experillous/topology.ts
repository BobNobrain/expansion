import * as THREE from 'three';
import { type Mesh } from './mesh';
import { calculateTriangleArea, intersectRayWithSphere } from './utils';

export class Corner {
    id: number;
    position: THREE.Vector3;
    corners: Corner[];
    borders: Border[];
    tiles: Tile[];
    area = 0;

    constructor(id: number, position: THREE.Vector3, cornerCount: number, borderCount: number, tileCount: number) {
        this.id = id;
        this.position = position;
        this.corners = new Array<Corner>(cornerCount);
        this.borders = new Array<Border>(borderCount);
        this.tiles = new Array<Tile>(tileCount);
    }

    vectorTo(corner: Corner) {
        return corner.position.clone().sub(this.position);
    }
}

export class Border {
    id: number;
    corners: Corner[];
    borders: Border[];
    tiles: Tile[];
    midpoint!: THREE.Vector3;

    constructor(id: number, cornerCount: number, borderCount: number, tileCount: number) {
        this.id = id;
        this.corners = new Array<Corner>(cornerCount);
        this.borders = new Array<Border>(borderCount);
        this.tiles = new Array<Tile>(tileCount);
    }

    oppositeCorner(corner: Corner) {
        return this.corners[0] === corner ? this.corners[1] : this.corners[0];
    }

    oppositeTile(tile: Tile) {
        return this.tiles[0] === tile ? this.tiles[1] : this.tiles[0];
    }

    length() {
        return this.corners[0].position.distanceTo(this.corners[1].position);
    }

    // isLandBoundary() {
    //     return this.tiles[0].elevation > 0 !== this.tiles[1].elevation > 0;
    // }
}

export class Tile {
    id: number;
    position: THREE.Vector3;
    corners: Corner[];
    borders: Border[];
    tiles: Tile[];
    boundingSphere!: THREE.Sphere;
    normal!: THREE.Vector3;
    averagePosition!: THREE.Vector3;
    area = 0;

    constructor(id: number, position: THREE.Vector3, cornerCount: number, borderCount: number, tileCount: number) {
        this.id = id;
        this.position = position;
        this.corners = new Array<Corner>(cornerCount);
        this.borders = new Array<Border>(borderCount);
        this.tiles = new Array<Tile>(tileCount);
    }

    intersectRay(ray: THREE.Ray) {
        if (!intersectRayWithSphere(ray, this.boundingSphere)) return false;

        const surface = new THREE.Plane().setFromNormalAndCoplanarPoint(this.normal, this.averagePosition);
        if (surface.distanceToPoint(ray.origin) <= 0) return false;

        const denominator = surface.normal.dot(ray.direction);
        if (denominator === 0) return false;

        const t = -(ray.origin.dot(surface.normal) + surface.constant) / denominator;
        const point = ray.direction.clone().multiplyScalar(t).add(ray.origin);

        const origin = new THREE.Vector3(0, 0, 0);
        for (let i = 0; i < this.corners.length; ++i) {
            const j = (i + 1) % this.corners.length;
            const side = new THREE.Plane().setFromCoplanarPoints(
                this.corners[j].position,
                this.corners[i].position,
                origin,
            );

            if (side.distanceToPoint(point) < 0) return false;
        }

        return true;
    }
}

export function generatePlanetTopology(mesh: Mesh) {
    const corners = new Array<Corner>(mesh.faces.length);
    const borders = new Array<Border>(mesh.edges.length);
    const tiles = new Array<Tile>(mesh.nodes.length);

    for (let i = 0; i < mesh.faces.length; ++i) {
        const face = mesh.faces[i];
        corners[i] = new Corner(
            i,
            face.centroid!.clone().multiplyScalar(1000),
            face.e.length,
            face.e.length,
            face.n.length,
        );
    }

    for (let i = 0; i < mesh.edges.length; ++i) {
        // const edge = mesh.edges[i];
        borders[i] = new Border(i, 2, 4, 2); //edge.f.length, mesh.faces[edge.f[0]].e.length + mesh.faces[edge.f[1]].e.length - 2, edge.n.length
    }

    for (let i = 0; i < mesh.nodes.length; ++i) {
        const node = mesh.nodes[i];
        tiles[i] = new Tile(i, node.p.clone().multiplyScalar(1000), node.f.length, node.e.length, node.e.length);
    }

    for (let i = 0; i < corners.length; ++i) {
        const corner = corners[i];
        const face = mesh.faces[i];
        for (let j = 0; j < face.e.length; ++j) {
            corner.borders[j] = borders[face.e[j]];
        }
        for (let j = 0; j < face.n.length; ++j) {
            corner.tiles[j] = tiles[face.n[j]];
        }
    }

    for (let i = 0; i < borders.length; ++i) {
        const border = borders[i];
        const edge = mesh.edges[i];
        const averageCorner = new THREE.Vector3(0, 0, 0);
        let n = 0;
        for (let j = 0; j < edge.f.length; ++j) {
            const corner = corners[edge.f[j]];
            averageCorner.add(corner.position);
            border.corners[j] = corner;
            for (let k = 0; k < corner.borders.length; ++k) {
                if (corner.borders[k] !== border) border.borders[n++] = corner.borders[k];
            }
        }
        border.midpoint = averageCorner.multiplyScalar(1 / border.corners.length);
        for (let j = 0; j < edge.n.length; ++j) {
            border.tiles[j] = tiles[edge.n[j]];
        }
    }

    for (let i = 0; i < corners.length; ++i) {
        const corner = corners[i];
        for (let j = 0; j < corner.borders.length; ++j) {
            corner.corners[j] = corner.borders[j].oppositeCorner(corner);
        }
    }

    for (let i = 0; i < tiles.length; ++i) {
        const tile = tiles[i];
        const node = mesh.nodes[i];
        for (let j = 0; j < node.f.length; ++j) {
            tile.corners[j] = corners[node.f[j]];
        }
        for (let j = 0; j < node.e.length; ++j) {
            const border = borders[node.e[j]];
            if (border.tiles[0] === tile) {
                for (let k = 0; k < tile.corners.length; ++k) {
                    const corner0 = tile.corners[k];
                    const corner1 = tile.corners[(k + 1) % tile.corners.length];
                    if (border.corners[1] === corner0 && border.corners[0] === corner1) {
                        border.corners[0] = corner0;
                        border.corners[1] = corner1;
                    } else if (border.corners[0] !== corner0 || border.corners[1] !== corner1) {
                        continue;
                    }
                    tile.borders[k] = border;
                    tile.tiles[k] = border.oppositeTile(tile);
                    break;
                }
            } else {
                for (let k = 0; k < tile.corners.length; ++k) {
                    const corner0 = tile.corners[k];
                    const corner1 = tile.corners[(k + 1) % tile.corners.length];
                    if (border.corners[0] === corner0 && border.corners[1] === corner1) {
                        border.corners[1] = corner0;
                        border.corners[0] = corner1;
                    } else if (border.corners[1] !== corner0 || border.corners[0] !== corner1) {
                        continue;
                    }
                    tile.borders[k] = border;
                    tile.tiles[k] = border.oppositeTile(tile);
                    break;
                }
            }
        }

        tile.averagePosition = new THREE.Vector3(0, 0, 0);
        for (let j = 0; j < tile.corners.length; ++j) {
            tile.averagePosition.add(tile.corners[j].position);
        }
        tile.averagePosition.multiplyScalar(1 / tile.corners.length);

        let maxDistanceToCorner = 0;
        for (let j = 0; j < tile.corners.length; ++j) {
            maxDistanceToCorner = Math.max(
                maxDistanceToCorner,
                tile.corners[j].position.distanceTo(tile.averagePosition),
            );
        }

        let area = 0;
        for (let j = 0; j < tile.borders.length; ++j) {
            area += calculateTriangleArea(
                tile.position,
                tile.borders[j].corners[0].position,
                tile.borders[j].corners[1].position,
            );
        }
        tile.area = area;

        tile.normal = tile.position.clone().normalize();

        tile.boundingSphere = new THREE.Sphere(tile.averagePosition, maxDistanceToCorner);
    }

    for (let i = 0; i < corners.length; ++i) {
        const corner = corners[i];
        corner.area = 0;
        for (let j = 0; j < corner.tiles.length; ++j) {
            corner.area += corner.tiles[j].area / corner.tiles[j].corners.length;
        }
    }

    return { corners: corners, borders: borders, tiles: tiles };
}

export type Topology = ReturnType<typeof generatePlanetTopology>;
