import { type ApiError, type LoginResponseBody } from './types.generated';

export type LoginRequest = {
    username: string;
    password: string;
};

export type UserData = {
    username: string;
};

export async function login({ username, password }: LoginRequest): Promise<UserData> {
    const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(((await response.json()) as ApiError).message);
    }

    const user = (await response.json()) as LoginResponseBody;

    return {
        username: user.username,
    };
}

export async function logout(): Promise<void> {
    const response = await fetch('/api/logout', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error(((await response.json()) as ApiError).message);
    }
}
