import { createContext, useContext } from 'solid-js';

export type AuthenticatedData = {
    logout: () => Promise<void>;
};
export const AuthenticatedContext = createContext<AuthenticatedData>({
    logout: () => Promise.reject(new Error('no context value')),
});
export const useAuthenticated = () => useContext(AuthenticatedContext);
