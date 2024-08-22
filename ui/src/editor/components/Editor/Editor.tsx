import { createMemo, type Component } from 'solid-js';
import { getSchemaForPath } from '../../../lib/jsonschema';
import { type SchemaType, type EditorProps } from './types';
import { StringEditor, type StringEditorProps } from '../StringEditor/StringEditor';
import { ObjectEditor, type ObjectEditorProps } from '../ObjectEditor/ObjectEditor';
import { getSchemaType } from './utils';

export const Editor: Component<EditorProps> = (props) => {
    const schema = createMemo(() => {
        return getSchemaForPath(props.schemaFile, props.path);
    });

    const schemaType = createMemo<SchemaType | undefined>(() => {
        const s = schema();
        return getSchemaType(s);
    });

    return createMemo(() => {
        const type = schemaType();
        if (!type) {
            console.log(schema());
            return <div>Cannot figure out schema</div>;
        }

        const editorProps = { ...props, Editor, schema: schema() };

        switch (type) {
            case 'string':
                return <StringEditor {...(editorProps as StringEditorProps)} />;

            case 'object':
                return <ObjectEditor {...(editorProps as ObjectEditorProps)} />;

            default:
                return <div>No component found for '{type}' schema</div>;
        }
    }) as never;
};
