import { type CurrentUserData } from '../../domain/User';
import { createDatafrontSingleton } from '../../lib/datafront/singleton';
import { type MeSingletonValue } from '../../lib/net/types.generated';
import { ws } from '../../lib/net/ws';
import { updater } from './misc';

export const dfMe = createDatafrontSingleton<MeSingletonValue, CurrentUserData>({
    name: 'me',
    ws,
    updater,
    map: (u) => ({
        user: {
            id: u.userId,
            username: u.username,
            created: new Date(u.created),
            status: {
                isVerified: true,
                license: 'free',
            },
        },
    }),
});
