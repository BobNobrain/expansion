import { type Component } from 'solid-js';
import { type EditorComponentProps } from '../Editor/types';
import { TextInput } from '../../../components/TextInput/TextInput';
import { type StringSchema } from '../../../lib/jsonschema';

export type StringEditorProps = EditorComponentProps<StringSchema>;

export const StringEditor: Component<StringEditorProps> = (props) => {
    const [get, set] = props.getLens<string>(props.path);

    return (
        <div>
            <TextInput
                value={get()}
                onUpdate={set}
                placeholder={(props.schema.default as string) || props.schema.title}
            />
        </div>
    );
};
