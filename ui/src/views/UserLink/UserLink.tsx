import { Show, type Component } from 'solid-js';
import { Link, SkeletonText } from '@/atoms';
import { getUserRoute } from '@/routes/misc';
import { dfUsers } from '@/store/datafront';

export type UserLinkProps = {
    id: string | null;
};

export const UserLink: Component<UserLinkProps> = (props) => {
    const user = dfUsers.useSingle(() => props.id);

    return (
        <Show when={user.result()} fallback={<SkeletonText length={12} />}>
            <Link href={getUserRoute({ uname: user.result()!.username })}>{user.result()!.username}</Link>
        </Show>
    );
};
