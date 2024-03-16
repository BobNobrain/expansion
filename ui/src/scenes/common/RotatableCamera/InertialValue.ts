const EPS = 1e-8;
const DELTA_MOVEMENT_VELOCITY_FACTOR = 0.8;

export class InertialValue {
    private value = 0;

    private min = -Infinity;
    private max = Infinity;

    private velocity = 0;
    private inertia = 0;

    private inertiaEnabled = false;

    constructor(initialValue = 0) {
        this.value = initialValue;
    }

    setLimits(min: number, max: number): InertialValue {
        this.min = min;
        this.max = max;
        return this;
    }
    setInertia(inertia: number) {
        this.inertia = inertia;
    }

    hold() {
        this.inertiaEnabled = false;
    }
    release() {
        this.inertiaEnabled = true;
    }

    get() {
        return this.value;
    }

    set(newValue: number) {
        this.value = Math.max(this.min, Math.min(newValue, this.max));
    }

    update(delta: number) {
        const newValue = this.value + delta;
        this.value = Math.max(this.min, Math.min(newValue, this.max));
    }

    inertialUpdate(delta: number) {
        const newValue = this.value + delta;
        this.value = Math.max(this.min, Math.min(newValue, this.max));
        this.velocity = delta * DELTA_MOVEMENT_VELOCITY_FACTOR;
    }

    /** @returns if animation has finished */
    animationStep(): boolean {
        if (!this.inertiaEnabled || !this.velocity) {
            return true;
        }

        this.update(this.velocity);
        this.velocity *= this.inertia;

        if (Math.abs(this.velocity) < EPS) {
            this.velocity = 0;
            return true;
        }

        return false;
    }
}
