import { createContext, useContext } from 'solid-js';
import { type UserData } from '../../lib/net/api';

export type AuthenticatedData = {
    user: () => UserData | null;
    logout: () => Promise<void>;
};
export const AuthenticatedContext = createContext<AuthenticatedData>({
    user: () => null,
    logout: () => Promise.reject(new Error('no context value')),
});
export const useAuthenticated = () => useContext(AuthenticatedContext);
