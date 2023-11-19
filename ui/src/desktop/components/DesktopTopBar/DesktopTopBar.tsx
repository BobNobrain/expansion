import { type Component } from 'solid-js';
import { useAuthenticated } from '../../../components/LogInGuard';
import { Text } from '../../../components/Text/Text';
import { TopBar } from '../../../components/TopBar/TopBar';
// import { useWindowManager } from '../../window/context';
import { useOnlineCount } from '../../../store/online';

export const DesktopTopBar: Component = () => {
    const { user, logout } = useAuthenticated();
    // const wm = useWindowManager();
    const onlineCount = useOnlineCount();

    return (
        <TopBar
            left={['14 CREDITS', '6 PENNY', '1 APPLE']}
            right={[
                <Text color="success">&bull; {onlineCount()}</Text>,
                <span
                    onClick={() => {
                        // console.log(wm);
                        // wm()?.createWindow({
                        //     title: { text: 'Profile settings' },
                        //     attributes: {
                        //         constrainWidth: { min: 400, max: 1000 },
                        //         constrainHeight: { min: 200, max: 500 },
                        //     },
                        // });
                        void logout();
                    }}
                >
                    Welcome, {user()?.username}!
                </span>,
            ]}
        />
    );
};
