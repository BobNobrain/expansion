import { Show, type Component } from 'solid-js';
import { InlineLoader } from '@/atoms';
import { LogInForm } from '@/components/LogInGuard/LogInForm/LogInForm';
import { ws } from '@/lib/net/ws';
import { useAuth } from '@/store/auth';
import { TouchModal } from '../TouchModal';

export const TouchLoginModal: Component = () => {
    const { login, error, isLoading, isLoggedIn } = useAuth();

    return (
        <TouchModal top isOpen={!isLoggedIn()}>
            <Show when={!isLoggedIn() && !ws.isConnecting()}>
                <LogInForm loading={isLoading()} onSubmit={login} error={error()} />
            </Show>
            <Show when={ws.isConnecting()}>
                <InlineLoader /> Connecting...
            </Show>
        </TouchModal>
    );
};
