import { Show, type Component } from 'solid-js';
import { IconCross, IconUser } from '../../icons';
import { dfMe } from '../../store/datafront';
import { Button } from '../Button/Button';
import { Container, Spacer } from '../Container/Container';
import { SkeletonText } from '../Skeleton';
import { Text } from '../Text/Text';
import { useAuth } from '../../store/auth';

export const UserFeed: Component = () => {
    const { logout } = useAuth();
    const me = dfMe.use();

    return (
        <Container hasGap padded fullHeight direction="column">
            <Container hasGap direction="row">
                <IconUser size={32} />
                <Container hasGap direction="column" stretch>
                    <Text bold size="h3">
                        <Show when={me.value()} fallback={<SkeletonText />}>
                            {me.value()?.user.username}
                        </Show>
                    </Text>
                    <Text>
                        Registered{' '}
                        <Show when={me.value()} fallback={<SkeletonText />}>
                            {me.value()?.user.created.toLocaleDateString()}
                        </Show>
                    </Text>
                </Container>
                <Button style="text" onClick={logout}>
                    <IconCross size={16} />
                </Button>
            </Container>

            <div>(no company info available)</div>
            <div>Subscription status: FREE (verified)</div>
            <div>0 new messages</div>
            <div>0 pending contracts</div>
            <div>Other notifications</div>

            <Spacer />
            <div>Expansion v0.0.1 - (debug not supported)</div>
        </Container>
    );
};
