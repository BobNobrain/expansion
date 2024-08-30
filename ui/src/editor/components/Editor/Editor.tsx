import { createMemo, type Component } from 'solid-js';
import { getSchemaForPath } from '../../../lib/jsonschema';
import { type SchemaType, type EditorProps } from './types';
import { NumberEditor, type NumberEditorProps } from './NumberEditor/NumberEditor';
import { ObjectEditor, type ObjectEditorProps } from './ObjectEditor/ObjectEditor';
import { StringEditor, type StringEditorProps } from './StringEditor/StringEditor';
import { getSchemaType } from './utils';
import { allPlugins } from './plugins';

export const Editor: Component<EditorProps> = (props) => {
    const schema = createMemo(() => {
        return getSchemaForPath(props.schemaFile, props.path);
    });

    const schemaType = createMemo<SchemaType | undefined>(() => {
        const s = schema();
        return getSchemaType(s);
    });

    return createMemo(() => {
        const s = schema();
        const editorProps = { ...props, Editor, schema: s };

        for (const plugin of allPlugins) {
            if (!plugin.test(s)) {
                continue;
            }

            return plugin.component(editorProps);
        }

        const type = schemaType();
        if (!type) {
            console.log(s);
            return <div>Cannot figure out schema</div>;
        }

        switch (type) {
            case 'string':
                return <StringEditor {...(editorProps as StringEditorProps)} />;

            case 'object':
                return <ObjectEditor {...(editorProps as ObjectEditorProps)} />;

            case 'number':
                return <NumberEditor {...(editorProps as NumberEditorProps)} />;

            default:
                return <div>No component found for '{type}' schema</div>;
        }
    }) as never;
};
