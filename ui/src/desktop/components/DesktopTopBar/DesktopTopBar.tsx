import { type Component } from 'solid-js';
import { useAuthenticated } from '../../../components/LogInGuard';
import { Text } from '../../../atoms/Text/Text';
import { TopBar } from '../../../components/TopBar/TopBar';
import { dfOnline } from '../../../store/datafront';
// import { useWindowManager } from '../../window/context';

export const DesktopTopBar: Component = () => {
    const { logout } = useAuthenticated();
    // const wm = useWindowManager();
    const onlineCount = dfOnline.use();

    return (
        <TopBar
            left={['14 CREDITS', '6 PENNY', '1 APPLE']}
            right={[
                <Text color="success">&bull; {onlineCount.value() ?? '??'}</Text>,
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
                    Welcome, username!
                </span>,
            ]}
        />
    );
};
