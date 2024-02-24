import { type Listenable, type Listener } from '../event';

export abstract class Detector {
    private subs: {
        ev: Listenable<void>;
        id: number;
    }[] = [];
    protected tap(ev: Listenable<void>, l: Listener<void>) {
        const id = ev.on(l);
        this.subs.push({ ev, id });
    }

    destroy() {
        for (const { ev, id } of this.subs) {
            ev.off(id);
        }
        this.subs.length = 0;
    }
}
