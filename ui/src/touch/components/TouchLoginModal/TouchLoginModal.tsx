import { type Component } from 'solid-js';
import { useAuth } from '../../../store/auth';
import { TouchModal } from '../TouchModal';
import { LogInForm } from '../../../components/LogInGuard/LogInForm/LogInForm';

export const TouchLoginModal: Component = () => {
    const { login, error, isLoading, isLoggedIn } = useAuth();

    return (
        <TouchModal isOpen={!isLoggedIn()}>
            <LogInForm loading={isLoading()} onSubmit={login} error={error()} />
        </TouchModal>
    );
};
