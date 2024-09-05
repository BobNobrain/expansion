import { type EditorPlugin } from '../types';
import { colorEditorPlugin } from './ColorEditor/ColorEditor';
import { phaseDiagramEditorPlugin } from './PhaseDiagramEditor/PhaseDiagramEditor';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const allPlugins: EditorPlugin<any>[] = [colorEditorPlugin, phaseDiagramEditorPlugin];
