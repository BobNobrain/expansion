import { createDatafrontCleaner } from '../../lib/datafront/cleaner';
import { createDatafrontUpdater } from '../../lib/datafront/updater';
import { ws } from '../../lib/net/ws';

export const updater = createDatafrontUpdater(ws);
export const cleaner = createDatafrontCleaner(60_000);
