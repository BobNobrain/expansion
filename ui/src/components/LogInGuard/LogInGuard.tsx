import { type ParentComponent, Show, createSignal, onMount } from 'solid-js';
import * as api from '../../lib/net/api';
import { ws } from '../../lib/net/ws';
import { LogInForm } from './LogInForm/LogInForm';
import { AuthenticatedContext, type AuthenticatedData } from './context';
import { SplashScreen } from './SplashScreen/SplashScreen';

export const LogInGuard: ParentComponent = (props) => {
    const [isAuthenticated, setAuthenticated] = createSignal<boolean>(false);
    const [getIsSubmitting, setIsSubmitting] = createSignal(false);
    const [getIsConnecting, setIsConnecting] = createSignal(true);

    const submit = async (creds: api.LoginRequest) => {
        setIsSubmitting(true);
        try {
            const userData = await api.login(creds);
            await ws.connect();
            console.log(userData);
            setAuthenticated(true);
        } catch (error) {
            console.error(error);
        }
        setIsSubmitting(false);
    };

    onMount(() => {
        void ws.connect().catch(() => {
            setIsConnecting(false);
        });
    });

    const logout = async () => {
        await api.logout();
        setAuthenticated(false);
        ws.disconnect();
    };

    const context: AuthenticatedData = {
        logout,
    };

    return (
        <Show
            when={getIsConnecting()}
            fallback={
                <Show
                    when={!isAuthenticated()}
                    fallback={
                        <AuthenticatedContext.Provider value={context}>{props.children}</AuthenticatedContext.Provider>
                    }
                >
                    <LogInForm loading={getIsSubmitting()} onSubmit={(creds) => void submit(creds)} error={null} />
                </Show>
            }
        >
            <SplashScreen />
        </Show>
    );
};
