import { Show, type Component } from 'solid-js';
import styles from './EditorPanel.module.css';
import { Button } from '../../../components/Button/Button';
import { FormContext, type FormFieldController } from '../../../components/Form';
import { type SchemaFile, type ObjectWithSchema } from '../../../lib/jsonschema/types';
import { useFileContent, useFileSaver } from '../../../store/editor';
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

    let rootController: FormFieldController | null = null;
    const formCtx: FormContext = {
        registerControl(key, field) {
            if (key !== '') {
                console.log('invalid root controller registration attempt', key, field);
                return { initialValue: undefined };
            }

            rootController = field;
            return {
                initialValue: fileContent.data,
            };
        },
        unregisterControl(key) {
            if (key !== '') {
                console.log('invalid root controller deregistration attempt', key);
                return;
            }
            rootController = null;
        },
    };

    const saveMutation = useFileSaver(() => props.activePath!);

    const onSave = () => {
        if (!rootController) {
            return;
        }

        if (!rootController.validate()) {
            return;
        }

        const data = rootController.retrieveValue();
        console.log(data);
        const json = JSON.stringify(data, null, 4);
        saveMutation.mutate(json, {
            onError: (error) => {
                console.error('could not save', error);
            },
        });
    };

    return (
        <div class={styles.panel}>
            <div class={styles.bar}>
                <div class={styles.title}>{props.activePath || '–'}</div>
                <Button
                    rightWing="none"
                    color="primary"
                    disabled={props.activePath === null}
                    onClick={onSave}
                    loading={saveMutation.isPending}
                >
                    Save
                </Button>
            </div>
            <div class={styles.content}>
                <Show
                    when={fileContent.data && schemaContent.data}
                    fallback={<div class={styles.emptyMessage}>{statusMessage()}</div>}
                >
                    <FormContext.Provider value={formCtx}>
                        <FileEditor data={fileContent.data} schema={schemaContent.data as SchemaFile} />
                    </FormContext.Provider>
                </Show>
            </div>
        </div>
    );
};
