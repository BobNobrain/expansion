import { type Component } from 'solid-js';
import { Container, Spacer } from '../Container/Container';
import { IconCross, IconUser } from '../../icons';
import { Text } from '../Text/Text';
import { useAuthenticated } from '../LogInGuard';
import { Button } from '../Button/Button';
import { useNavigate } from '@solidjs/router';

export const UserFeed: Component = () => {
    const { user, logout } = useAuthenticated();
    const navigate = useNavigate();

    const onLogoutClick = () => {
        void logout().then(() => navigate('/'));
    };

    return (
        <Container hasGap padded fullHeight direction="column">
            <Container hasGap direction="row">
                <IconUser size={32} />
                <Container hasGap direction="column" stretch>
                    <Text bold size="h3">
                        {user()?.username}
                    </Text>
                    <Text>Registered some time ago</Text>
                </Container>
                <Button style="text" onClick={onLogoutClick}>
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
