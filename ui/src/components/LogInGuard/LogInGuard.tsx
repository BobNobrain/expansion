import { type ParentComponent, Show, createSignal, onMount } from 'solid-js';
import * as api from '../../lib/net/api';
import { ws } from '../../lib/net/ws';
import { LogInForm } from './LogInForm/LogInForm';
import { AuthenticatedContext, type AuthenticatedData } from './context';

export const LogInGuard: ParentComponent = (props) => {
    const [getUser, setUser] = createSignal<api.UserData | null>(null);
    const [getLoading, setLoading] = createSignal(false);

    const submit = async (creds: api.LoginRequest) => {
        setLoading(true);
        try {
            const userData = await api.login(creds);
            setUser(userData);
            await ws.connect();
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    };

    onMount(() => {
        void submit({ username: '', password: '' });
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
            when={getUser() === null}
            fallback={<AuthenticatedContext.Provider value={context}>{props.children}</AuthenticatedContext.Provider>}
        >
            <LogInForm loading={getLoading()} onSubmit={(creds) => void submit(creds)} />
        </Show>
    );
};
