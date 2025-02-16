import { createDatafrontSingleton } from '../../lib/datafront/singleton';
import { type DFOnlineValue } from '../../lib/net/types.generated';
import { ws } from '../../lib/net/ws';
import { updater } from './misc';

export const dfOnline = createDatafrontSingleton<DFOnlineValue, number>({
    name: 'online',
    ws,
    updater,
    map: (value) => value.count,
});
