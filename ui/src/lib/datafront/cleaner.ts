import { createEvent } from '../event';

export type DatafrontCleaner = {
    triggerCleanup: () => void;
    addCleanup: (cleanup: () => void) => void;
};

export function createDatafrontCleaner(intervalMs: number): DatafrontCleaner {
    const cleanupEvent = createEvent<void>();

    setInterval(() => cleanupEvent.trigger(), intervalMs);

    return {
        triggerCleanup() {
            cleanupEvent.trigger();
        },
        addCleanup(cleanup) {
            cleanupEvent.on(cleanup);
        },
    };
}
