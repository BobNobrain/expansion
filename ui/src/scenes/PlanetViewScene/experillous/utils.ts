import * as THREE from 'three';
import type { XorShift128 } from './random';

export function hashString(s: string): number {
    let hash = 0;
    const length = s.length;
    if (length === 0) return hash;
    for (let i = 0; i < length; ++i) {
        const character = s.charCodeAt(1);
        hash = (hash << 5) - hash + character;
        hash |= 0;
    }
    return hash;
}

export function calculateTriangleArea(pa: THREE.Vector3, pb: THREE.Vector3, pc: THREE.Vector3): number {
    const vab = new THREE.Vector3().subVectors(pb, pa);
    const vac = new THREE.Vector3().subVectors(pc, pa);
    const faceNormal = new THREE.Vector3().crossVectors(vab, vac);
    const vabNormal = new THREE.Vector3().crossVectors(faceNormal, vab).normalize();
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(vabNormal, pa);
    const height = plane.distanceToPoint(pc);
    const width = vab.length();
    const area = width * height * 0.5;
    return area;
}

export function accumulateArray<T, U>(array: T[], state: U, accumulator: (state: U, next: T) => U): U {
    for (let i = 0; i < array.length; ++i) {
        state = accumulator(state, array[i]);
    }
    return state;
}

export function adjustRange(value: number, oldMin: number, oldMax: number, newMin: number, newMax: number) {
    return ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
}

export function slerp(p0: THREE.Vector3, p1: THREE.Vector3, t: number) {
    const omega = Math.acos(p0.dot(p1));
    return p0
        .clone()
        .multiplyScalar(Math.sin((1 - t) * omega))
        .add(p1.clone().multiplyScalar(Math.sin(t * omega)))
        .divideScalar(Math.sin(omega));
}

export function randomUnitVector(random: XorShift128) {
    const theta = random.real(0, Math.PI * 2);
    const phi = Math.acos(random.realInclusive(-1, 1));
    const sinPhi = Math.sin(phi);
    return new THREE.Vector3(Math.cos(theta) * sinPhi, Math.sin(theta) * sinPhi, Math.cos(phi));
}

export function randomQuaternion(random: XorShift128) {
    const theta = random.real(0, Math.PI * 2);
    const phi = Math.acos(random.realInclusive(-1, 1));
    const sinPhi = Math.sin(phi);
    const gamma = random.real(0, Math.PI * 2);
    const sinGamma = Math.sin(gamma);
    return new THREE.Quaternion(
        Math.cos(theta) * sinPhi * sinGamma,
        Math.sin(theta) * sinPhi * sinGamma,
        Math.cos(phi) * sinGamma,
        Math.cos(gamma),
    );
}

export function intersectRayWithSphere(ray: THREE.Ray, sphere: THREE.Sphere) {
    const v1 = sphere.center.clone().sub(ray.origin);
    const v2 = v1.clone().projectOnVector(ray.direction);
    const d = v1.distanceTo(v2);
    return d <= sphere.radius;
}
