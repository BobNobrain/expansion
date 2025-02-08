import { createSignal } from 'solid-js';
import { type DatafrontError, toDatafrontError } from '../lib/datafront/error';
import * as api from '../lib/net/api';
import { ws } from '../lib/net/ws';

export type UseAuthResult = {
    login: (payload: api.LoginRequest) => void;
    logout: () => void;
    tryInitialAuth: () => void;
    isLoggedIn: () => boolean;
    isLoading: () => boolean;
    error: () => DatafrontError | null;
};

const [isLoggedIn, setLoggedIn] = createSignal(false);
const [isLoading, setLoading] = createSignal(false);
const [error, setError] = createSignal<DatafrontError | null>(null);
let initialAuthProgress: Promise<void> | null = null;

function login(payload: api.LoginRequest) {
    if (isLoading() || isLoggedIn()) {
        return;
    }

    setLoading(true);
    setError(null);

    (initialAuthProgress ?? Promise.resolve())
        .then(() => api.login(payload))
        .then((userData) => {
            console.debug('[login]', userData);
            return ws.connect();
        })
        .then(() => {
            setLoggedIn(true);
            setLoading(false);
        })
        .catch((error) => {
            console.error('[login]', error);
            setError(toDatafrontError(error));
            setLoading(false);
        });
}

function logout() {
    if (isLoading() || !isLoggedIn()) {
        return;
    }

    setLoading(true);
    setError(null);

    api.logout()
        .then(() => {
            ws.disconnect();
            setLoggedIn(false);
            setLoading(false);
        })
        .catch((error) => {
            console.error('[logout]', error);
            setError(toDatafrontError(error));
            setLoading(false);
        });
}

function tryInitialAuth() {
    if (isLoading() || isLoggedIn() || initialAuthProgress) {
        return;
    }

    initialAuthProgress = new Promise((resolve) => {
        ws.connect()
            .then(() => {
                // if connected, we must have already received a valid session token
                setLoggedIn(true);
                resolve();
                initialAuthProgress = null;
            })
            .catch((error) => {
                console.warn('[initial auth]', error);
                ws.disconnect();
                resolve();
                initialAuthProgress = null;
            });
    });
}

export function useAuth(): UseAuthResult {
    return {
        isLoading,
        isLoggedIn,
        error,

        login,
        logout,
        tryInitialAuth,
    };
}
