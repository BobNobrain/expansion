import { Vector3, type PerspectiveCamera } from 'three';
import { type RawVertex } from '@/lib/3d/types';
import { InertialValue } from './InertialValue';

const PITCH_MIN = 0.087; // ~5deg
const PITCH_MAX = Math.PI - PITCH_MIN;

export class RotatableCameraState {
    private yaw = new InertialValue(0);
    private pitch = new InertialValue(Math.PI / 2).setLimits(PITCH_MIN, PITCH_MAX);
    private distance = 0;

    private targetX = new InertialValue(0);
    private targetY = new InertialValue(0);
    private targetZ = new InertialValue(0);

    private allInertials: InertialValue[] = [this.yaw, this.pitch, this.targetX, this.targetY, this.targetZ];

    apply(cam: PerspectiveCamera) {
        const targetX = this.targetX.get();
        const targetY = this.targetY.get();
        const targetZ = this.targetZ.get();

        cam.position
            .setFromSphericalCoords(this.distance, this.pitch.get(), this.yaw.get())
            .add(new Vector3(targetX, targetY, targetZ));

        cam.lookAt(targetX, targetY, targetZ);
    }

    setYaw(yaw: number) {
        this.yaw.set(yaw);
    }
    setPitch(pitch: number) {
        this.pitch.set(pitch);
    }

    updateRotationWithInertia(dyaw: number, dpitch: number) {
        this.yaw.inertialUpdate(dyaw);
        this.pitch.inertialUpdate(dpitch);
    }

    getDistance(): number {
        return this.distance;
    }
    setDistance(d: number) {
        this.distance = d;
    }

    release() {
        for (const i of this.allInertials) {
            i.release();
        }
    }
    hold() {
        for (const i of this.allInertials) {
            i.hold();
        }
    }

    setRotationInertia(yawInertia: number, pitchInertia: number) {
        this.yaw.setInertia(yawInertia);
        this.pitch.setInertia(pitchInertia);
    }

    animationStep(): boolean {
        let finished = true;
        for (const i of this.allInertials) {
            const iFinished = i.animationStep();
            if (!iFinished) {
                finished = false;
            }
        }
        return finished;
    }

    setMoveInertia(factor: number) {
        this.targetX.setInertia(factor);
        this.targetY.setInertia(factor);
        this.targetZ.setInertia(factor);
    }

    inertialUpdateTarget(dx: number, dy: number, dz: number) {
        this.targetX.inertialUpdate(dx);
        this.targetY.inertialUpdate(dy);
        this.targetZ.inertialUpdate(dz);
    }

    setPanLimits(limits: { xMin: number; xMax: number; yMin: number; yMax: number; zMin: number; zMax: number }) {
        this.targetX.setLimits(limits.xMin, limits.xMax);
        this.targetY.setLimits(limits.yMin, limits.yMax);
        this.targetZ.setLimits(limits.zMin, limits.zMax);
    }

    pan(dUp: number, dRight: number, planeNormal: RawVertex | undefined) {
        const look = new Vector3().setFromSphericalCoords(1, this.pitch.get(), this.yaw.get());

        const panPlaneNormal = new Vector3();
        if (planeNormal) {
            panPlaneNormal.set(...planeNormal);
        } else {
            panPlaneNormal.set(-look.x, -look.y, -look.z);
        }

        const rightAxis = new Vector3(0, -1, 0).cross(look).normalize();
        const upAxis = rightAxis.clone().cross(look).normalize();

        if (planeNormal) {
            rightAxis.projectOnPlane(panPlaneNormal).normalize();
            upAxis.projectOnPlane(panPlaneNormal).normalize();
        }

        upAxis.multiplyScalar(dUp);
        rightAxis.multiplyScalar(-dRight);
        const total = upAxis.add(rightAxis);

        this.targetX.inertialUpdate(total.x);
        this.targetY.inertialUpdate(total.y);
        this.targetZ.inertialUpdate(total.z);
    }
}
