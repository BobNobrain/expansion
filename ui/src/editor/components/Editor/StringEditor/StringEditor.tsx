import { createSignal, type Component, onCleanup, untrack } from 'solid-js';
import { type EditorComponentProps } from '../types';
import { TextInput } from '../../../../components/TextInput/TextInput';
import { type StringSchema } from '../../../../lib/jsonschema';

export type StringEditorProps = EditorComponentProps<StringSchema>;

export const StringEditor: Component<StringEditorProps> = (props) => {
    const [getValue, setValue] = createSignal((props.initialValue as string) || '');

    props.controller?.({
        preview: () => {
            const value = untrack(getValue);
            return value;
        },
    });
    onCleanup(() => {
        props.controller?.(null);
    });

    return (
        <TextInput
            value={getValue()}
            onUpdate={setValue}
            placeholder={(props.schema.default as string) || props.schema.title}
        />
    );
};
