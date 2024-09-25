import { createSignal, type Component, untrack } from 'solid-js';
import { type ObjectSchema } from '../../../../../lib/jsonschema';
import { Color, type RGBColor } from '../../../../../lib/color';
import { ColorInput } from '../../../../../components/ColorInput/ColorInput';
import { type EditorComponentProps, type EditorPlugin } from '../../types';

type ColorEditorProps = EditorComponentProps<ObjectSchema>;

const ColorEditor: Component<ColorEditorProps> = (props) => {
    const [value, setValue] = createSignal(props.initialValue as RGBColor);

    props.controller?.({
        preview: () => Color.toHexString(untrack(value)),
    });

    return (
        <ColorInput
            value={value()}
            onUpdate={setValue}
            alpha={props.schema.properties.a ? 'optional' : 'forbidden'}
            formKey={props.key}
        />
    );
};

export const colorEditorPlugin: EditorPlugin<ObjectSchema> = {
    component: ColorEditor,
    test: (schema) => {
        for (const kind of schema.editorHints?.kinds ?? []) {
            const strKind = typeof kind === 'string' ? kind : kind.kind;
            if (strKind === 'color') {
                return true;
            }
        }
        return false;
    },
};
