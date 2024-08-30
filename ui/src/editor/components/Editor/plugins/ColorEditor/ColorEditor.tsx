import { createSignal, type Component, untrack } from 'solid-js';
import { type ObjectSchema } from '../../../../../lib/jsonschema';
import { Color, type RGBColor } from '../../../../../lib/color';
import { ColorInput } from '../../../../../components/ColorInput/ColorInput';
import { type EditorComponentProps, type EditorPlugin } from '../../types';

type ColorEditorProps = EditorComponentProps<ObjectSchema>;

const ColorEditor: Component<ColorEditorProps> = (props) => {
    const [value, setValue] = createSignal(Color.toHexString(props.initialValue as RGBColor));

    props.controller?.({
        preview: () => untrack(value),
    });

    return (
        <ColorInput
            value={value()}
            onUpdate={setValue}
            alpha={props.schema.properties.a ? 'optional' : 'forbidden'}
            formKey={props.path[props.path.length - 1] as string}
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
