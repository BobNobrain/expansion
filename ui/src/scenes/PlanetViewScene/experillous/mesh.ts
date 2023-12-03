import * as THREE from 'three';
import { type XorShift128 } from './random';
import { slerp } from './utils';

export function generatePlanetMesh(
    icosahedronSubdivision: number,
    topologyDistortionRate: number,
    random: XorShift128,
) {
    const mesh = generateSubdividedIcosahedron(icosahedronSubdivision);

    let totalDistortion = Math.ceil(mesh.edges.length * topologyDistortionRate);
    let remainingIterations = 6;
    while (remainingIterations > 0) {
        const iterationDistortion = Math.floor(totalDistortion / remainingIterations);
        totalDistortion -= iterationDistortion;
        distortMesh(mesh, iterationDistortion, random);
        relaxMesh(mesh, 0.5);
        --remainingIterations;
    }

    // Relaxing Triangle Mesh
    const averageNodeRadius = Math.sqrt((4 * Math.PI) / mesh.nodes.length);
    const minShiftDelta = (averageNodeRadius / 50000) * mesh.nodes.length;
    // const maxShiftDelta = (averageNodeRadius / 50) * mesh.nodes.length;

    let priorShift;
    let currentShift = relaxMesh(mesh, 0.5);
    for (let i = 0; i < 300; i++) {
        priorShift = currentShift;
        currentShift = relaxMesh(mesh, 0.5);
        const shiftDelta = Math.abs(currentShift - priorShift);
        if (shiftDelta < minShiftDelta) {
            break;
        }
    }

    // Calculating Triangle Centroids
    for (let i = 0; i < mesh.faces.length; ++i) {
        const face = mesh.faces[i];
        const p0 = mesh.nodes[face.n[0]].p;
        const p1 = mesh.nodes[face.n[1]].p;
        const p2 = mesh.nodes[face.n[2]].p;
        face.centroid = calculateFaceCentroid(p0, p1, p2).normalize();
    }

    // Reordering Triangle Nodes
    for (let i = 0; i < mesh.nodes.length; ++i) {
        const node = mesh.nodes[i];
        let faceIndex = node.f[0];
        for (let j = 1; j < node.f.length - 1; ++j) {
            faceIndex = findNextFaceIndex(mesh, i, faceIndex);
            const k = node.f.indexOf(faceIndex);
            node.f[k] = node.f[j];
            node.f[j] = faceIndex;
        }
    }
}

export type Node = {
    p: THREE.Vector3;
    e: number[];
    f: number[];
};
export type Edge = {
    n: number[];
    f: number[];

    subdivided_n?: number[];
    subdivided_e?: number[];
};
export type Face = {
    n: number[];
    e: number[];
    centroid?: THREE.Vector3;
};

export type Mesh = {
    edges: Edge[];
    faces: Face[];
    nodes: Node[];
};

function generateIcosahedron() {
    const phi = (1.0 + Math.sqrt(5.0)) / 2.0;
    const du = 1.0 / Math.sqrt(phi * phi + 1.0);
    const dv = phi * du;

    const nodes: Node[] = [
        { p: new THREE.Vector3(0, +dv, +du), e: [], f: [] },
        { p: new THREE.Vector3(0, +dv, -du), e: [], f: [] },
        { p: new THREE.Vector3(0, -dv, +du), e: [], f: [] },
        { p: new THREE.Vector3(0, -dv, -du), e: [], f: [] },
        { p: new THREE.Vector3(+du, 0, +dv), e: [], f: [] },
        { p: new THREE.Vector3(-du, 0, +dv), e: [], f: [] },
        { p: new THREE.Vector3(+du, 0, -dv), e: [], f: [] },
        { p: new THREE.Vector3(-du, 0, -dv), e: [], f: [] },
        { p: new THREE.Vector3(+dv, +du, 0), e: [], f: [] },
        { p: new THREE.Vector3(+dv, -du, 0), e: [], f: [] },
        { p: new THREE.Vector3(-dv, +du, 0), e: [], f: [] },
        { p: new THREE.Vector3(-dv, -du, 0), e: [], f: [] },
    ];

    const edges: Edge[] = [
        { n: [0, 1], f: [] },
        { n: [0, 4], f: [] },
        { n: [0, 5], f: [] },
        { n: [0, 8], f: [] },
        { n: [0, 10], f: [] },
        { n: [1, 6], f: [] },
        { n: [1, 7], f: [] },
        { n: [1, 8], f: [] },
        { n: [1, 10], f: [] },
        { n: [2, 3], f: [] },
        { n: [2, 4], f: [] },
        { n: [2, 5], f: [] },
        { n: [2, 9], f: [] },
        { n: [2, 11], f: [] },
        { n: [3, 6], f: [] },
        { n: [3, 7], f: [] },
        { n: [3, 9], f: [] },
        { n: [3, 11], f: [] },
        { n: [4, 5], f: [] },
        { n: [4, 8], f: [] },
        { n: [4, 9], f: [] },
        { n: [5, 10], f: [] },
        { n: [5, 11], f: [] },
        { n: [6, 7], f: [] },
        { n: [6, 8], f: [] },
        { n: [6, 9], f: [] },
        { n: [7, 10], f: [] },
        { n: [7, 11], f: [] },
        { n: [8, 9], f: [] },
        { n: [10, 11], f: [] },
    ];

    const faces: Face[] = [
        { n: [0, 1, 8], e: [0, 7, 3] },
        { n: [0, 4, 5], e: [1, 18, 2] },
        { n: [0, 5, 10], e: [2, 21, 4] },
        { n: [0, 8, 4], e: [3, 19, 1] },
        { n: [0, 10, 1], e: [4, 8, 0] },
        { n: [1, 6, 8], e: [5, 24, 7] },
        { n: [1, 7, 6], e: [6, 23, 5] },
        { n: [1, 10, 7], e: [8, 26, 6] },
        { n: [2, 3, 11], e: [9, 17, 13] },
        { n: [2, 4, 9], e: [10, 20, 12] },
        { n: [2, 5, 4], e: [11, 18, 10] },
        { n: [2, 9, 3], e: [12, 16, 9] },
        { n: [2, 11, 5], e: [13, 22, 11] },
        { n: [3, 6, 7], e: [14, 23, 15] },
        { n: [3, 7, 11], e: [15, 27, 17] },
        { n: [3, 9, 6], e: [16, 25, 14] },
        { n: [4, 8, 9], e: [19, 28, 20] },
        { n: [5, 11, 10], e: [22, 29, 21] },
        { n: [6, 9, 8], e: [25, 28, 24] },
        { n: [7, 10, 11], e: [26, 29, 27] },
    ];

    for (let i = 0; i < edges.length; ++i) for (let j = 0; j < edges[i].n.length; ++j) nodes[j].e.push(i);

    for (let i = 0; i < faces.length; ++i) for (let j = 0; j < faces[i].n.length; ++j) nodes[j].f.push(i);

    for (let i = 0; i < faces.length; ++i) for (let j = 0; j < faces[i].e.length; ++j) edges[j].f.push(i);

    return { nodes: nodes, edges: edges, faces: faces };
}

function generateSubdividedIcosahedron(degree: number): Mesh {
    const icosahedron = generateIcosahedron();

    const nodes: Node[] = [];
    for (let i = 0; i < icosahedron.nodes.length; ++i) {
        nodes.push({ p: icosahedron.nodes[i].p, e: [], f: [] });
    }

    const edges: Edge[] = [];
    for (let i = 0; i < icosahedron.edges.length; ++i) {
        const edge = icosahedron.edges[i];
        edge.subdivided_n = [];
        edge.subdivided_e = [];
        const n0 = icosahedron.nodes[edge.n[0]];
        const n1 = icosahedron.nodes[edge.n[1]];
        const p0 = n0.p;
        const p1 = n1.p;
        // const delta = p1.clone().sub(p0);
        nodes[edge.n[0]].e.push(edges.length);
        let priorNodeIndex = edge.n[0];
        for (let s = 1; s < degree; ++s) {
            const edgeIndex = edges.length;
            const nodeIndex = nodes.length;
            edge.subdivided_e.push(edgeIndex);
            edge.subdivided_n.push(nodeIndex);
            edges.push({ n: [priorNodeIndex, nodeIndex], f: [] });
            priorNodeIndex = nodeIndex;
            nodes.push({ p: slerp(p0, p1, s / degree), e: [edgeIndex, edgeIndex + 1], f: [] });
        }
        edge.subdivided_e.push(edges.length);
        nodes[edge.n[1]].e.push(edges.length);
        edges.push({ n: [priorNodeIndex, edge.n[1]], f: [] });
    }

    const faces: Face[] = [];
    for (let i = 0; i < icosahedron.faces.length; ++i) {
        const face = icosahedron.faces[i];
        const edge0 = icosahedron.edges[face.e[0]];
        const edge1 = icosahedron.edges[face.e[1]];
        const edge2 = icosahedron.edges[face.e[2]];
        // const point0 = icosahedron.nodes[face.n[0]].p;
        // const point1 = icosahedron.nodes[face.n[1]].p;
        // const point2 = icosahedron.nodes[face.n[2]].p;
        // const delta = point1.clone().sub(point0);

        const getEdgeNode0 =
            face.n[0] === edge0.n[0]
                ? function (k: number) {
                      return edge0.subdivided_n![k];
                  }
                : function (k: number) {
                      return edge0.subdivided_n![degree - 2 - k];
                  };
        const getEdgeNode1 =
            face.n[1] === edge1.n[0]
                ? function (k: number) {
                      return edge1.subdivided_n![k];
                  }
                : function (k: number) {
                      return edge1.subdivided_n![degree - 2 - k];
                  };
        const getEdgeNode2 =
            face.n[0] === edge2.n[0]
                ? function (k: number) {
                      return edge2.subdivided_n![k];
                  }
                : function (k: number) {
                      return edge2.subdivided_n![degree - 2 - k];
                  };

        const faceNodes = [];
        faceNodes.push(face.n[0]);
        for (let j = 0; j < edge0.subdivided_n!.length; ++j) faceNodes.push(getEdgeNode0(j));
        faceNodes.push(face.n[1]);
        for (let s = 1; s < degree; ++s) {
            faceNodes.push(getEdgeNode2(s - 1));
            const p0 = nodes[getEdgeNode2(s - 1)].p;
            const p1 = nodes[getEdgeNode1(s - 1)].p;
            for (let t = 1; t < degree - s; ++t) {
                faceNodes.push(nodes.length);
                nodes.push({ p: slerp(p0, p1, t / (degree - s)), e: [], f: [] });
            }
            faceNodes.push(getEdgeNode1(s - 1));
        }
        faceNodes.push(face.n[2]);

        const getEdgeEdge0 =
            face.n[0] === edge0.n[0]
                ? function (k: number) {
                      return edge0.subdivided_e![k];
                  }
                : function (k: number) {
                      return edge0.subdivided_e![degree - 1 - k];
                  };
        const getEdgeEdge1 =
            face.n[1] === edge1.n[0]
                ? function (k: number) {
                      return edge1.subdivided_e![k];
                  }
                : function (k: number) {
                      return edge1.subdivided_e![degree - 1 - k];
                  };
        const getEdgeEdge2 =
            face.n[0] === edge2.n[0]
                ? function (k: number) {
                      return edge2.subdivided_e![k];
                  }
                : function (k: number) {
                      return edge2.subdivided_e![degree - 1 - k];
                  };

        const faceEdges0 = [];
        for (let j = 0; j < degree; ++j) faceEdges0.push(getEdgeEdge0(j));
        let nodeIndex = degree + 1;
        for (let s = 1; s < degree; ++s) {
            for (let t = 0; t < degree - s; ++t) {
                faceEdges0.push(edges.length);
                const edge = { n: [faceNodes[nodeIndex], faceNodes[nodeIndex + 1]], f: [] };
                nodes[edge.n[0]].e.push(edges.length);
                nodes[edge.n[1]].e.push(edges.length);
                edges.push(edge);
                ++nodeIndex;
            }
            ++nodeIndex;
        }

        const faceEdges1 = [];
        nodeIndex = 1;
        for (let s = 0; s < degree; ++s) {
            for (let t = 1; t < degree - s; ++t) {
                faceEdges1.push(edges.length);
                const edge = { n: [faceNodes[nodeIndex], faceNodes[nodeIndex + degree - s]], f: [] };
                nodes[edge.n[0]].e.push(edges.length);
                nodes[edge.n[1]].e.push(edges.length);
                edges.push(edge);
                ++nodeIndex;
            }
            faceEdges1.push(getEdgeEdge1(s));
            nodeIndex += 2;
        }

        const faceEdges2 = [];
        nodeIndex = 1;
        for (let s = 0; s < degree; ++s) {
            faceEdges2.push(getEdgeEdge2(s));
            for (let t = 1; t < degree - s; ++t) {
                faceEdges2.push(edges.length);
                const edge = { n: [faceNodes[nodeIndex], faceNodes[nodeIndex + degree - s + 1]], f: [] };
                nodes[edge.n[0]].e.push(edges.length);
                nodes[edge.n[1]].e.push(edges.length);
                edges.push(edge);
                ++nodeIndex;
            }
            nodeIndex += 2;
        }

        nodeIndex = 0;
        let edgeIndex = 0;
        for (let s = 0; s < degree; ++s) {
            for (let t = 1; t < degree - s + 1; ++t) {
                const subFace = {
                    n: [faceNodes[nodeIndex], faceNodes[nodeIndex + 1], faceNodes[nodeIndex + degree - s + 1]],
                    e: [faceEdges0[edgeIndex], faceEdges1[edgeIndex], faceEdges2[edgeIndex]],
                };
                nodes[subFace.n[0]].f.push(faces.length);
                nodes[subFace.n[1]].f.push(faces.length);
                nodes[subFace.n[2]].f.push(faces.length);
                edges[subFace.e[0]].f.push(faces.length);
                edges[subFace.e[1]].f.push(faces.length);
                edges[subFace.e[2]].f.push(faces.length);
                faces.push(subFace);
                ++nodeIndex;
                ++edgeIndex;
            }
            ++nodeIndex;
        }

        nodeIndex = 1;
        edgeIndex = 0;
        for (let s = 1; s < degree; ++s) {
            for (let t = 1; t < degree - s + 1; ++t) {
                const subFace = {
                    n: [
                        faceNodes[nodeIndex],
                        faceNodes[nodeIndex + degree - s + 2],
                        faceNodes[nodeIndex + degree - s + 1],
                    ],
                    e: [faceEdges2[edgeIndex + 1], faceEdges0[edgeIndex + degree - s + 1], faceEdges1[edgeIndex]],
                };
                nodes[subFace.n[0]].f.push(faces.length);
                nodes[subFace.n[1]].f.push(faces.length);
                nodes[subFace.n[2]].f.push(faces.length);
                edges[subFace.e[0]].f.push(faces.length);
                edges[subFace.e[1]].f.push(faces.length);
                edges[subFace.e[2]].f.push(faces.length);
                faces.push(subFace);
                ++nodeIndex;
                ++edgeIndex;
            }
            nodeIndex += 2;
            edgeIndex += 1;
        }
    }

    return { nodes: nodes, edges: edges, faces: faces };
}

function getEdgeOppositeFaceIndex(edge: Edge, faceIndex: number) {
    if (edge.f[0] === faceIndex) return edge.f[1];
    if (edge.f[1] === faceIndex) return edge.f[0];
    throw 'Given face is not part of given edge.';
}

function getFaceOppositeNodeIndex(face: Face, edge: Edge) {
    if (face.n[0] !== edge.n[0] && face.n[0] !== edge.n[1]) return 0;
    if (face.n[1] !== edge.n[0] && face.n[1] !== edge.n[1]) return 1;
    if (face.n[2] !== edge.n[0] && face.n[2] !== edge.n[1]) return 2;
    throw 'Cannot find node of given face that is not also a node of given edge.';
}

function findNextFaceIndex(mesh: Mesh, nodeIndex: number, faceIndex: number) {
    // const node = mesh.nodes[nodeIndex];
    const face = mesh.faces[faceIndex];
    const nodeFaceIndex = face.n.indexOf(nodeIndex);
    const edge = mesh.edges[face.e[(nodeFaceIndex + 2) % 3]];
    return getEdgeOppositeFaceIndex(edge, faceIndex);
}

function conditionalRotateEdge(
    mesh: Mesh,
    edgeIndex: number,
    predicate: (a: Node, b: Node, c: Node, d: Node) => boolean,
) {
    const edge = mesh.edges[edgeIndex];
    const face0 = mesh.faces[edge.f[0]];
    const face1 = mesh.faces[edge.f[1]];
    const farNodeFaceIndex0 = getFaceOppositeNodeIndex(face0, edge);
    const farNodeFaceIndex1 = getFaceOppositeNodeIndex(face1, edge);
    const newNodeIndex0 = face0.n[farNodeFaceIndex0];
    const oldNodeIndex0 = face0.n[(farNodeFaceIndex0 + 1) % 3];
    const newNodeIndex1 = face1.n[farNodeFaceIndex1];
    const oldNodeIndex1 = face1.n[(farNodeFaceIndex1 + 1) % 3];
    const oldNode0 = mesh.nodes[oldNodeIndex0];
    const oldNode1 = mesh.nodes[oldNodeIndex1];
    const newNode0 = mesh.nodes[newNodeIndex0];
    const newNode1 = mesh.nodes[newNodeIndex1];
    const newEdgeIndex0 = face1.e[(farNodeFaceIndex1 + 2) % 3];
    const newEdgeIndex1 = face0.e[(farNodeFaceIndex0 + 2) % 3];
    const newEdge0 = mesh.edges[newEdgeIndex0];
    const newEdge1 = mesh.edges[newEdgeIndex1];

    if (!predicate(oldNode0, oldNode1, newNode0, newNode1)) return false;

    oldNode0.e.splice(oldNode0.e.indexOf(edgeIndex), 1);
    oldNode1.e.splice(oldNode1.e.indexOf(edgeIndex), 1);
    newNode0.e.push(edgeIndex);
    newNode1.e.push(edgeIndex);

    edge.n[0] = newNodeIndex0;
    edge.n[1] = newNodeIndex1;

    newEdge0.f.splice(newEdge0.f.indexOf(edge.f[1]), 1);
    newEdge1.f.splice(newEdge1.f.indexOf(edge.f[0]), 1);
    newEdge0.f.push(edge.f[0]);
    newEdge1.f.push(edge.f[1]);

    oldNode0.f.splice(oldNode0.f.indexOf(edge.f[1]), 1);
    oldNode1.f.splice(oldNode1.f.indexOf(edge.f[0]), 1);
    newNode0.f.push(edge.f[1]);
    newNode1.f.push(edge.f[0]);

    face0.n[(farNodeFaceIndex0 + 2) % 3] = newNodeIndex1;
    face1.n[(farNodeFaceIndex1 + 2) % 3] = newNodeIndex0;

    face0.e[(farNodeFaceIndex0 + 1) % 3] = newEdgeIndex0;
    face1.e[(farNodeFaceIndex1 + 1) % 3] = newEdgeIndex1;
    face0.e[(farNodeFaceIndex0 + 2) % 3] = edgeIndex;
    face1.e[(farNodeFaceIndex1 + 2) % 3] = edgeIndex;

    return true;
}

function calculateFaceCentroid(pa: THREE.Vector3, pb: THREE.Vector3, pc: THREE.Vector3) {
    const vabHalf = pb.clone().sub(pa).divideScalar(2);
    const pabHalf = pa.clone().add(vabHalf);
    const centroid = pc
        .clone()
        .sub(pabHalf)
        .multiplyScalar(1 / 3)
        .add(pabHalf);
    return centroid;
}

function distortMesh(mesh: Mesh, degree: number, random: XorShift128) {
    // const totalSurfaceArea = 4 * Math.PI;
    // const idealFaceArea = totalSurfaceArea / mesh.faces.length;
    // const idealEdgeLength = Math.sqrt((idealFaceArea * 4) / Math.sqrt(3));
    // const idealFaceHeight = idealEdgeLength * Math.sqrt(3) / 2;

    const rotationPredicate = function (oldNode0: Node, oldNode1: Node, newNode0: Node, newNode1: Node) {
        if (newNode0.f.length >= 7 || newNode1.f.length >= 7 || oldNode0.f.length <= 5 || oldNode1.f.length <= 5)
            return false;
        const oldEdgeLength = oldNode0.p.distanceTo(oldNode1.p);
        const newEdgeLength = newNode0.p.distanceTo(newNode1.p);
        const ratio = oldEdgeLength / newEdgeLength;
        if (ratio >= 2 || ratio <= 0.5) return false;
        const v0 = oldNode1.p.clone().sub(oldNode0.p).divideScalar(oldEdgeLength);
        const v1 = newNode0.p.clone().sub(oldNode0.p).normalize();
        const v2 = newNode1.p.clone().sub(oldNode0.p).normalize();
        if (v0.dot(v1) < 0.2 || v0.dot(v2) < 0.2) return false;
        v0.negate();
        const v3 = newNode0.p.clone().sub(oldNode1.p).normalize();
        const v4 = newNode1.p.clone().sub(oldNode1.p).normalize();
        if (v0.dot(v3) < 0.2 || v0.dot(v4) < 0.2) return false;
        return true;
    };

    let i = 0;
    while (i < degree) {
        let consecutiveFailedAttempts = 0;
        let edgeIndex = random.integerExclusive(0, mesh.edges.length);
        while (!conditionalRotateEdge(mesh, edgeIndex, rotationPredicate)) {
            if (++consecutiveFailedAttempts >= mesh.edges.length) return false;
            edgeIndex = (edgeIndex + 1) % mesh.edges.length;
        }

        ++i;
    }

    return true;
}

function relaxMesh(mesh: Mesh, multiplier: number) {
    const totalSurfaceArea = 4 * Math.PI;
    const idealFaceArea = totalSurfaceArea / mesh.faces.length;
    const idealEdgeLength = Math.sqrt((idealFaceArea * 4) / Math.sqrt(3));
    const idealDistanceToCentroid = ((idealEdgeLength * Math.sqrt(3)) / 3) * 0.9;

    const pointShifts = new Array<THREE.Vector3>(mesh.nodes.length);
    for (let i = 0; i < mesh.nodes.length; ++i) {
        pointShifts[i] = new THREE.Vector3(0, 0, 0);
    }

    for (let i = 0; i < mesh.faces.length; i++) {
        const face = mesh.faces[i];
        const n0 = mesh.nodes[face.n[0]];
        const n1 = mesh.nodes[face.n[1]];
        const n2 = mesh.nodes[face.n[2]];
        const p0 = n0.p;
        const p1 = n1.p;
        const p2 = n2.p;
        // const e0 = p1.distanceTo(p0) / idealEdgeLength;
        // const e1 = p2.distanceTo(p1) / idealEdgeLength;
        // const e2 = p0.distanceTo(p2) / idealEdgeLength;
        const centroid = calculateFaceCentroid(p0, p1, p2).normalize();
        const v0 = centroid.clone().sub(p0);
        const v1 = centroid.clone().sub(p1);
        const v2 = centroid.clone().sub(p2);
        const length0 = v0.length();
        const length1 = v1.length();
        const length2 = v2.length();
        v0.multiplyScalar((multiplier * (length0 - idealDistanceToCentroid)) / length0);
        v1.multiplyScalar((multiplier * (length1 - idealDistanceToCentroid)) / length1);
        v2.multiplyScalar((multiplier * (length2 - idealDistanceToCentroid)) / length2);
        pointShifts[face.n[0]].add(v0);
        pointShifts[face.n[1]].add(v1);
        pointShifts[face.n[2]].add(v2);
    }

    const origin = new THREE.Vector3(0, 0, 0);
    const plane = new THREE.Plane();
    for (let i = 0; i < mesh.nodes.length; ++i) {
        plane.setFromNormalAndCoplanarPoint(mesh.nodes[i].p, origin);
        const projection = new THREE.Vector3();
        plane.projectPoint(pointShifts[i], projection);
        pointShifts[i] = mesh.nodes[i].p.clone().add(projection).normalize();
    }

    const rotationSupressions = new Array<number>(mesh.nodes.length);
    for (let i = 0; i < mesh.nodes.length; ++i) rotationSupressions[i] = 0;

    for (let i = 0; i < mesh.edges.length; i++) {
        const edge = mesh.edges[i];
        const oldPoint0 = mesh.nodes[edge.n[0]].p;
        const oldPoint1 = mesh.nodes[edge.n[1]].p;
        const newPoint0 = pointShifts[edge.n[0]];
        const newPoint1 = pointShifts[edge.n[1]];
        const oldVector = oldPoint1.clone().sub(oldPoint0).normalize();
        const newVector = newPoint1.clone().sub(newPoint0).normalize();
        const suppression = (1 - oldVector.dot(newVector)) * 0.5;
        rotationSupressions[edge.n[0]] = Math.max(rotationSupressions[edge.n[0]], suppression);
        rotationSupressions[edge.n[1]] = Math.max(rotationSupressions[edge.n[1]], suppression);
    }

    let totalShift = 0;
    for (let i = 0; i < mesh.nodes.length; ++i) {
        const node = mesh.nodes[i];
        const point = node.p;
        const delta = point.clone();
        point.lerp(pointShifts[i], 1 - Math.sqrt(rotationSupressions[i])).normalize();
        delta.sub(point);
        totalShift += delta.length();
    }

    return totalShift;
}
