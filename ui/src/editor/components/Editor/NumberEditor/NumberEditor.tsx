import { createSignal, type Component, untrack } from 'solid-js';
import { NumberInputOld } from '@/atoms/NumberInputOld/NumberInput';
import { type NumberSchema } from '@/lib/jsonschema';
import { type EditorComponentProps } from '../types';
import { useController } from '../hooks';

export type NumberEditorProps = EditorComponentProps<NumberSchema>;

export const NumberEditor: Component<NumberEditorProps> = (props) => {
    const [getValue, setValue] = createSignal((props.initialValue as number) ?? 0);

    useController(props, {
        preview: () => {
            const value = untrack(getValue);
            return String(value);
        },
    });

    return (
        <NumberInputOld
            value={getValue()}
            onUpdate={setValue}
            min={props.schema.minimum}
            max={props.schema.maximum}
            multipleOf={props.schema.multipleOf}
            formKey={props.key}
            disabled={props.disabled}
        />
    );
};
