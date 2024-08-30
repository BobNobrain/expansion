import { type Component, For, createMemo, createSignal, onCleanup } from 'solid-js';
import { type EditorController, type EditorComponentProps } from '../types';
import { getSchemaForPath, type Schema, type ObjectSchema } from '../../../../lib/jsonschema';
import styles from './ObjectEditor.module.css';
import { getSchemaType, isSimpleEditor } from '../utils';
import { Form, FormField } from '../../../../components/Form';

export type ObjectEditorProps = EditorComponentProps<ObjectSchema>;

type RowProps = {
    schema: Schema;
    key: string;
    innerController: (key: string, c: EditorController | null) => void;
};

const ObjectEditorRow: Component<Omit<ObjectEditorProps, 'schema'> & RowProps> = (props) => {
    const isSimple = createMemo(() => {
        const schemaType = getSchemaType(props.schema);
        return schemaType ? isSimpleEditor(schemaType) : true;
    });

    const [collapsedPreview, setCollapsedPreview] = createSignal('');
    let controller: EditorController | null = null;
    const setController = (c: EditorController | null) => {
        controller = c;
        props.innerController(props.key, c);
    };

    const updateCollapsedPreview = (isCollapsed: boolean) => {
        if (!isCollapsed) {
            setCollapsedPreview('');
            return;
        }

        setCollapsedPreview(controller?.preview() ?? '');
    };

    return (
        <FormField
            label={props.schema.title || props.key}
            description={props.schema.description}
            multiline={!isSimple()}
            collapsable
            collapsedPreview={collapsedPreview()}
            onToggleCollapsed={updateCollapsedPreview}
        >
            <props.Editor
                schemaFile={props.schemaFile}
                path={props.path}
                initialValue={props.initialValue}
                controller={setController}
            />
        </FormField>
    );
};

export const ObjectEditor: Component<ObjectEditorProps> = (props) => {
    const innerControllers: Record<string, EditorController> = {};

    const setController = (key: string, controller: EditorController | null) => {
        if (controller) {
            innerControllers[key] = controller;
        } else {
            delete innerControllers[key];
        }
    };

    props.controller?.({
        preview: () => {
            const preview: string[] = [];
            for (const [key, controller] of Object.entries(innerControllers)) {
                preview.push(`${key}: ${controller.preview()}`);
            }
            return `{ ${preview.join(', ')} }`;
        },
    });
    onCleanup(() => {
        props.controller?.(null);
    });

    return (
        <div class={styles.wrapper}>
            <Form formKey={props.path[props.path.length - 1] as string | undefined}>
                <For each={Object.keys(props.schema.properties)}>
                    {(key) => {
                        const path = [...props.path, key];
                        const propSchema = getSchemaForPath(props.schemaFile, path);

                        return (
                            <ObjectEditorRow
                                Editor={props.Editor}
                                path={path}
                                key={key}
                                schema={propSchema}
                                schemaFile={props.schemaFile}
                                initialValue={(props.initialValue as Record<string, unknown>)[key]}
                                innerController={setController}
                            />
                        );
                    }}
                </For>
            </Form>
        </div>
    );
};
