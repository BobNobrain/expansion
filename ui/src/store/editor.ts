import { createQuery, useQueryClient } from '@tanstack/solid-query';
import { EditorAPI } from '../lib/net/editorapi';

const api = new EditorAPI();

export function useEditorTree() {
    return createQuery(() => ({
        queryKey: ['editor', 'tree'],
        queryFn: () => api.getTree(),
    }));
}

export function useEditorTreeRefresher(): () => Promise<void> {
    const client = useQueryClient();
    return () => client.invalidateQueries({ queryKey: ['editor', 'tree'] });
}

export function useFileContent(filepath: () => string | null) {
    return createQuery(() => {
        const path = filepath();

        return {
            queryKey: ['editor', 'file', path],
            enabled: Boolean(path),
            queryFn: () => api.getFile(path || ''),
        };
    });
}
