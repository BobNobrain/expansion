import { Show, type Component } from 'solid-js';
import { getUserRoute } from '../../routes/misc';
import { dfUsers } from '../../store/datafront';
import { Link } from '../Link/Link';
import { SkeletonText } from '../Skeleton';

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
