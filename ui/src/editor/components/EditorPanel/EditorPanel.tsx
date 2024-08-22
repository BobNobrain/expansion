import { Show, type Component } from 'solid-js';
import styles from './EditorPanel.module.css';
import { Button } from '../../../components/Button/Button';
import { useFileContent } from '../../../store/editor';
import { type SchemaFile, type ObjectWithSchema } from '../../../lib/jsonschema/types';
import { FileEditor } from '../FileEditor/FileEditor';

export type EditorPanelProps = {
    activePath: string | null;
};

export const EditorPanel: Component<EditorPanelProps> = (props) => {
    const fileContent = useFileContent(() => props.activePath);
    const schemaContent = useFileContent(() => {
        if (!fileContent.data || !props.activePath) {
            return null;
        }
        const schema = (fileContent.data as ObjectWithSchema).$schema;
        if (!schema) {
            return null;
        }
        const parts = props.activePath.split('/');
        parts.pop();
        parts.push(schema);
        return parts.join('/');
    });

    const statusMessage = () => {
        if (!props.activePath) {
            return 'No file selected';
        }
        if (fileContent.isLoading) {
            return 'Loading file...';
        }
        if (schemaContent.isLoading) {
            return 'Loading schema...';
        }
        if (fileContent.error || schemaContent.error) {
            return fileContent.error?.message || schemaContent.error?.message || 'An error has occured';
        }
        if (fileContent.data && !schemaContent.data) {
            return 'No schema found for file';
        }
        return '';
    };

    return (
        <div class={styles.panel}>
            <div class={styles.bar}>
                <div class={styles.title}>{props.activePath || '–'}</div>
                <Button rightWing="none" color="primary" disabled={props.activePath === null}>
                    Save
                </Button>
            </div>
            <div class={styles.content}>
                <Show
                    when={fileContent.data && schemaContent.data}
                    fallback={<div class={styles.emptyMessage}>{statusMessage()}</div>}
                >
                    <FileEditor data={fileContent.data} schema={schemaContent.data as SchemaFile} />
                </Show>
            </div>
        </div>
    );
};
