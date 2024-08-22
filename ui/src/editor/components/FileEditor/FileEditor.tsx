import cloneDeep from 'lodash/cloneDeep';
import { createSignal, type Component, createMemo } from 'solid-js';
import { deepGet, deepSet, type JSONPath, type SchemaFile } from '../../../lib/jsonschema';
import { Editor } from '../Editor/Editor';

export type FileEditorProps = {
    data: unknown;
    schema: SchemaFile;
};

export const FileEditor: Component<FileEditorProps> = (props) => {
    const getLens = createMemo(() => {
        const value = cloneDeep(props.data);

        return <T,>(path: JSONPath): [() => T, (v: T) => void] => {
            const [get, set] = createSignal(deepGet(props.data, path));
            return [
                get as () => T,
                (newVal) => {
                    set(newVal as unknown);
                    deepSet(value, path, newVal);
                },
            ];
        };
    });

    return <Editor path={[]} schemaFile={props.schema} getLens={getLens()} />;
};
