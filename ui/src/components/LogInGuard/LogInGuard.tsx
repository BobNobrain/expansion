import { type ParentComponent, Show, createSignal, onMount } from 'solid-js';
import * as api from '../../lib/net/api';
import { ws } from '../../lib/net/ws';
import { LogInForm } from './LogInForm/LogInForm';
import { AuthenticatedContext, type AuthenticatedData } from './context';
import { type UserDataUpdateEventPayload } from '../../lib/net/types.generated';
import { SplashScreen } from './SplashScreen/SplashScreen';

export const LogInGuard: ParentComponent = (props) => {
    const [getUser, setUser] = createSignal<api.UserData | null>(null);
    const [getIsSubmitting, setIsSubmitting] = createSignal(false);
    const [getIsConnecting, setIsConnecting] = createSignal(true);

    const submit = async (creds: api.LoginRequest) => {
        setIsSubmitting(true);
        try {
            const userData = await api.login(creds);
            await ws.connect();
            setUser(userData);
        } catch (error) {
            console.error(error);
        }
        setIsSubmitting(false);
    };

    onMount(() => {
        void ws
            .connect()
            .then(() => {
                ws.subscribe('user', (evt) => {
                    switch (evt.event) {
                        case 'login': {
                            const { username } = evt.payload as UserDataUpdateEventPayload;
                            setUser({ username });
                            setIsConnecting(false);
                            break;
                        }
                    }
                });
            })
            .catch(() => {
                setIsConnecting(false);
            });
    });

    const logout = async () => {
        await api.logout();
        ws.disconnect();
        setUser(null);
    };

    const context: AuthenticatedData = {
        user: getUser,
        logout,
    };

    return (
        <Show
            when={getIsConnecting()}
            fallback={
                <Show
                    when={getUser() === null}
                    fallback={
                        <AuthenticatedContext.Provider value={context}>{props.children}</AuthenticatedContext.Provider>
                    }
                >
                    <LogInForm loading={getIsSubmitting()} onSubmit={(creds) => void submit(creds)} />
                </Show>
            }
        >
            <SplashScreen />
        </Show>
    );
};
