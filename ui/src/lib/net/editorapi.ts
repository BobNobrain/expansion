import type { FileTree } from './editorapi.generated';
import type { ApiError } from './types.generated';

export class EditorAPI {
    getTree(): Promise<FileTree> {
        return this.fetch<FileTree>('/api/tree');
    }

    getFile(path: string): Promise<unknown> {
        return this.fetch<unknown>('/api/file', { query: { path } });
    }

    saveFile(path: string, content: string) {
        return this.fetch('/api/file', {
            method: 'PUT',
            query: { path },
            body: content,
            noParse: true,
        });
    }

    async copyFile(oldPath: string, newPath: string) {
        const content = await this.fetch<unknown>('/api/file', { query: { path: oldPath }, noParse: true });
        return this.fetch('/api/file', {
            method: 'POST',
            query: { path: newPath },
            body: content,
            noParse: true,
        });
    }

    private async fetch<T>(
        path: string,
        opts?: {
            method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
            query?: Record<string, string>;
            body?: unknown;
            noParse?: boolean;
        },
    ): Promise<T> {
        const { method = 'GET', query = {}, body } = opts || {};

        const url = new URL(path, window.location.origin);
        for (const [key, value] of Object.entries(query)) {
            url.searchParams.set(key, value);
        }

        const resp = await fetch(url, {
            method,
            body: body ? (typeof body === 'string' ? body : JSON.stringify(body)) : undefined,
        });

        const responseBody = (await (opts?.noParse ? resp.text() : resp.json())) as T | ApiError;

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
