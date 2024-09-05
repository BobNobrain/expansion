import { type Component } from 'solid-js';
import { type OneOfSchema } from '../../../../../lib/jsonschema';
import { type EditorPlugin, type EditorComponentProps } from '../../types';
import { type PhaseDiagramData } from './types';
import { PhaseDiagramCanvas, type PhaseDiagramGraph } from './PhaseDiagramCanvas';

export type PhaseDiagramEditorProps = EditorComponentProps<OneOfSchema>;

export const PhaseDiagramEditor: Component<PhaseDiagramEditorProps> = (props) => {
    const data = props.initialValue as PhaseDiagramData;

    const lines: PhaseDiagramGraph[] = [];
    if ('melt' in data) {
        lines.push({ points: data.melt, color: '#2266ff' });
    }
    if ('boil' in data) {
        lines.push({ points: data.boil, color: '#aa5511' });
    }
    if ('subl' in data) {
        lines.push({ points: data.subl, color: '#559922' });
    }

    return <PhaseDiagramCanvas lines={lines} width={600} height={450} maxTempKelvin={500} maxPressureOrder={8} />;
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
