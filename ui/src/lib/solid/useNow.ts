import { createSignal, onCleanup } from 'solid-js';

type Precision = 's';

type SignalData = {
    signal: () => Date;
    uses: number;
    clear: () => void;
};

const signals: { [key in Precision]?: SignalData } = {};

function createNowSignal(precision: Precision): SignalData {
    const [now, updateNow] = createSignal(new Date());

    let timeoutId: number | undefined;
    let scheduleNextUpdate: () => void;
    switch (precision) {
        case 's':
            scheduleNextUpdate = () => {
                const nextSecondStartsIn = 1000 - (Date.now() % 1000);
                timeoutId = setTimeout(() => {
                    updateNow(new Date());
                    scheduleNextUpdate();
                }, nextSecondStartsIn);
            };
            break;

        default:
            return precision;
    }

    scheduleNextUpdate();
    return { signal: now, uses: 0, clear: () => clearTimeout(timeoutId) };
}

export function useNow(precision: Precision = 's'): () => Date {
    if (!signals[precision]) {
        signals[precision] = createNowSignal(precision);
    }

    const data = signals[precision];

    data.uses++;
    onCleanup(() => {
        data.uses--;
        if (data.uses <= 0) {
            data.clear();
            delete signals[precision];
        }
    });

    return data.signal;
}
