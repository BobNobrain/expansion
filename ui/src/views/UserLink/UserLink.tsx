import { Show, type Component } from 'solid-js';
import { Link, SkeletonText, Text } from '@/atoms';
import { userRoute } from '@/routes/misc';
import { dfUsers } from '@/store/datafront';

export type UserLinkProps = {
    id: string | null;
};

export const UserLink: Component<UserLinkProps> = (props) => {
    const user = dfUsers.useSingle(() => props.id);

    return (
        <Show when={props.id !== null} fallback={<SkeletonText length={12} />}>
            <Link href={userRoute.render({ uid: props.id! })}>
                <Show when={!user.isLoading()} fallback={<SkeletonText length={12} />}>
                    <Show when={user.error()}>
                        <Text color="error">{user.error()!.message}</Text>
                    </Show>
                    <Show when={user.result()}>{user.result()!.username}</Show>
                </Show>
            </Link>
        </Show>
    );
};
