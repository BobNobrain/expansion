import { type User } from '@/domain/User';
import { createDatafrontTable } from '@/lib/datafront/table';
import { type UsersTableRow } from '@/lib/net/types.generated';
import { ws } from '@/lib/net/ws';
import { updater, cleaner } from './misc';

export const dfUsers = createDatafrontTable<UsersTableRow, User>({
    name: 'users',
    ws,
    updater,
    cleaner,
    map: (u) => ({
        id: u.id,
        username: u.username || '',
        created: new Date(u.created || ''),
        status: {
            isVerified: true,
            license: 'free',
        },
    }),
});
