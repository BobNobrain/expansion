import { type Component, For, createMemo, createSignal, Show } from 'solid-js';
import { type EditorComponentProps } from '../Editor/types';
import { getSchemaForPath, type Schema, type ObjectSchema } from '../../../lib/jsonschema';
import styles from './ObjectEditor.module.css';
import { getSchemaType, isSimpleEditor } from '../Editor/utils';

export type ObjectEditorProps = EditorComponentProps<ObjectSchema>;

const ObjectEditorRow: Component<Omit<ObjectEditorProps, 'schema'> & { schema: Schema }> = (props) => {
    const isSimple = createMemo(() => {
        const schemaType = getSchemaType(props.schema);
        return schemaType ? isSimpleEditor(schemaType) : true;
    });

    const [isCollapsed, setIsCollapsed] = createSignal(false);

    const onNameClick = () => {
        if (isSimple()) {
            return;
        }

        setIsCollapsed((v) => !v);
    };

    const collapsedPreview = createMemo(() => {
        if (!isCollapsed()) {
            return '';
        }

        const [get] = props.getLens(props.path);
        const json = JSON.stringify(get());
        if (json === undefined) {
            return '';
        }
        if (json.length > 100) {
            return json.slice(0, 97) + '...';
        }
        return json;
    });

    return (
        <div class={styles.row} classList={{ [styles.multiline]: !isSimple(), [styles.collapsed]: isCollapsed() }}>
            <div title={props.schema.description} class={styles.name} onClick={onNameClick}>
                {props.schema.title || props.path[props.path.length - 1]}

                <Show when={isCollapsed()}>
                    <span class={styles.preview}>{collapsedPreview()}</span>
                </Show>
            </div>
            <Show when={!isCollapsed()}>
                <div class={styles.value}>
                    <props.Editor schemaFile={props.schemaFile} path={props.path} getLens={props.getLens} />
                </div>
            </Show>
        </div>
    );
};

export const ObjectEditor: Component<ObjectEditorProps> = (props) => {
    return (
        <div class={styles.wrapper}>
            <For each={Object.keys(props.schema.properties)}>
                {(key) => {
                    const path = [...props.path, key];
                    const propSchema = getSchemaForPath(props.schemaFile, path);

                    return (
                        <ObjectEditorRow
                            Editor={props.Editor}
                            getLens={props.getLens}
                            path={path}
                            schema={propSchema}
                            schemaFile={props.schemaFile}
                        />
                    );
                }}
            </For>
        </div>
    );
};
