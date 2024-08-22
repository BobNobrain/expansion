import type { FileTree } from './editorapi.generated';
import type { ApiError } from './types.generated';

export class EditorAPI {
    getTree(): Promise<FileTree> {
        return this.fetch<FileTree>('/api/tree');
    }

    getFile(path: string): Promise<unknown> {
        return this.fetch<unknown>('/api/file', { query: { path } });
    }

    private async fetch<T>(
        path: string,
        opts?: {
            method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
            query?: Record<string, string>;
            body?: unknown;
        },
    ): Promise<T> {
        const { method = 'GET', query = {}, body } = opts || {};

        const url = new URL(path, window.location.origin);
        for (const [key, value] of Object.entries(query)) {
            url.searchParams.set(key, value);
        }

        const resp = await fetch(url, {
            method,
            body: body ? JSON.stringify(body) : undefined,
        });

        const responseBody = (await resp.json()) as T | ApiError;

        if (resp.ok) {
            return responseBody as T;
        }

        throw new EditorApiError(responseBody as ApiError);
    }
}

export class EditorApiError extends Error {
    readonly code: string;
    readonly details: Record<string, unknown> | null;

    constructor(data: ApiError) {
        super(data.message);
        this.code = data.code;
        this.details = data.details as Record<string, unknown> | null;
    }
}
