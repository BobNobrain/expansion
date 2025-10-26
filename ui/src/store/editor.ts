import { createMutation, createQuery, useQueryClient } from '@tanstack/solid-query';
import { EditorAPI } from '@/lib/net/editorapi';

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
            staleTime: Infinity,
        };
    });
}

export function useFileSaver(filepath: () => string) {
    const client = useQueryClient();

    return createMutation(() => {
        const path = filepath();
        return {
            mutationKey: ['editor', 'file', path, 'save'],
            mutationFn: (content: string) => api.saveFile(path, content),
            onSuccess: () => {
                void client.invalidateQueries({ queryKey: ['editor', 'tree'] });
                void client.invalidateQueries({ queryKey: ['editor', 'file', path] });
            },
        };
    });
}

export function useFileDuplicator(filepath: () => string) {
    const client = useQueryClient();

    return createMutation(() => {
        const oldPath = filepath();
        return {
            mutationKey: ['editor', 'file', oldPath, 'copy'],
            mutationFn: (newPath: string) => api.copyFile(oldPath, newPath),
            onSuccess: () => {
                void client.invalidateQueries({ queryKey: ['editor', 'tree'] });
            },
        };
    });
}
