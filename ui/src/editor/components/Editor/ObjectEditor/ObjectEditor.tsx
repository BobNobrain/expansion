import { type Component, For, Show, createMemo, createSignal, onCleanup } from 'solid-js';
import { type EditorController, type EditorComponentProps } from '../types';
import { getSchemaForPath, type Schema, type ObjectSchema } from '../../../../lib/jsonschema';
import styles from './ObjectEditor.module.css';
import { getSchemaType, isSimpleEditor } from '../utils';
import { Form, FormField } from '../../../../components/Form';
import { Button } from '../../../../components/Button/Button';

export type ObjectEditorProps = EditorComponentProps<ObjectSchema>;

type RowProps = {
    schema: Schema;
    key: string;
    innerController: (key: string, c: EditorController | null) => void;
    isOptional: boolean;
    disabled?: boolean;
};

const ObjectEditorRow: Component<Omit<ObjectEditorProps, 'schema'> & RowProps> = (props) => {
    const isSimple = createMemo(() => {
        const schemaType = getSchemaType(props.schema);
        return schemaType ? isSimpleEditor(schemaType) : true;
    });

    const [collapsedPreview, setCollapsedPreview] = createSignal('');

    const [isDefined, setIsDefined] = createSignal(props.isOptional ? props.initialValue !== undefined : true);
    const setDefined = () => setIsDefined(true);
    const setUndefined = () => setIsDefined(false);

    let controller: EditorController | null = null;
    const setController = (c: EditorController | null) => {
        controller = c;
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
            <Show
                when={props.isOptional}
                fallback={
                    <props.Editor
                        schemaFile={props.schemaFile}
                        path={props.path}
                        initialValue={props.initialValue}
                        controller={setController}
                        key={props.key}
                    />
                }
            >
                <Show
                    when={isDefined()}
                    fallback={
                        <Button leftWing="none" rightWing="none" color="accent" onClick={setDefined}>
                            Add value
                        </Button>
                    }
                >
                    <div class={styles.fieldInputWrapper}>
                        <Button leftWing="none" rightWing="none" color="error" onClick={setUndefined}>
                            Remove value
                        </Button>
                        <props.Editor
                            schemaFile={props.schemaFile}
                            path={props.path}
                            initialValue={props.initialValue}
                            controller={setController}
                            key={props.key}
                            disabled={!isDefined()}
                        />
                    </div>
                </Show>
            </Show>
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
            <Form formKey={props.key}>
                <For each={Object.keys(props.schema.properties)}>
                    {(key) => {
                        const path = [...props.path, key];
                        const propSchema = getSchemaForPath(props.schemaFile, path);
                        const isRequired = props.schema.required ? props.schema.required.includes(key) : false;

                        return (
                            <ObjectEditorRow
                                Editor={props.Editor}
                                path={path}
                                key={key}
                                schema={propSchema}
                                schemaFile={props.schemaFile}
                                initialValue={(props.initialValue as Record<string, unknown>)[key]}
                                innerController={setController}
                                isOptional={!isRequired && !key.startsWith('$')}
                                disabled={props.disabled}
                            />
                        );
                    }}
                </For>
            </Form>
        </div>
    );
};
