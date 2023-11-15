import { createSignal } from 'solid-js';
import { ws } from '../lib/net/ws';

const [getOnlineCount, setOnlineCount] = createSignal(0);

type OnlineChangePayload = {
    count: number;
};

ws.subscribe('online', (ev) => {
    switch (ev.event) {
        case 'change':
            setOnlineCount((ev.payload as OnlineChangePayload).count);
            break;

        default:
            console.log(ev);
    }
});

export const useOnlineCount = () => getOnlineCount;
