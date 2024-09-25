import { untrack, type Component } from 'solid-js';
import { type OneOfSchema } from '../../../../../lib/jsonschema';
import { type EditorPlugin, type EditorComponentProps } from '../../types';
import { PhaseDiagramInput } from './PhaseDiagramInput';
import { type PhaseDiagramData } from './types';
import { usePhaseDiagramState } from './state';
import { useController } from '../../hooks';

export type PhaseDiagramEditorProps = EditorComponentProps<OneOfSchema>;

export const PhaseDiagramEditor: Component<PhaseDiagramEditorProps> = (props) => {
    const { state, updatePoint } = usePhaseDiagramState(props.initialValue as PhaseDiagramData | null);

    useController(props, {
        preview: () => {
            const type = untrack(() => state.type);
            return `PhaseDiagram(type='${type}')`;
        },
    });

    return <PhaseDiagramInput state={state} onPointUpdate={updatePoint} formKey={props.key} />;
};

export const phaseDiagramEditorPlugin: EditorPlugin<OneOfSchema> = {
    test: (schema) => {
        for (const kind of schema.editorHints?.kinds ?? []) {
            const strKind = typeof kind === 'string' ? kind : kind.kind;
            if (strKind === 'expansion.phased') {
                return true;
            }
        }
        return false;
    },
    component: PhaseDiagramEditor,
};
