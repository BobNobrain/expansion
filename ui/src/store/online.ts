import { createSignal } from 'solid-js';
import { ws } from '../lib/net/ws';
import { type OnlineCountChangeEventPayload } from '../lib/net/types.generated';

const [getOnlineCount, setOnlineCount] = createSignal(0);

ws.subscribe('online', (ev) => {
    switch (ev.event) {
        case 'change':
            setOnlineCount((ev.payload as OnlineCountChangeEventPayload).count);
            break;

        default:
            console.log(ev);
    }
});

export const useOnlineCount = () => getOnlineCount;
