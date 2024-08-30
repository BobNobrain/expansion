import { type Component } from 'solid-js';
import { type JSONPath, type SchemaFile } from '../../../lib/jsonschema';
import { Editor } from '../Editor/Editor';

export type FileEditorProps = {
    data: unknown;
    schema: SchemaFile;
};

export const FileEditor: Component<FileEditorProps> = (props) => {
    const emptyPath: JSONPath = [];
    return <Editor path={emptyPath} schemaFile={props.schema} initialValue={props.data} key="" />;
};
