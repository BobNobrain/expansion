import { type Component } from 'solid-js';
import type { Schema, InformativeFields, JSONPath, SchemaFile } from '../../../lib/jsonschema';

export type EditorPlugin<S = Schema> = {
    test: (schema: Schema) => boolean;
    component: Component<EditorComponentProps<S>>;
};

export type EditorProps = {
    initialValue: unknown;
    schemaFile: SchemaFile;
    path: JSONPath;
    key: string;
    controller?: (ctrl: EditorController | null) => void;
    disabled?: boolean;
};

export type EditorController = {
    preview: () => string;
};

export type EditorComponentProps<S> = {
    schema: S & InformativeFields;
    path: JSONPath;
    key: string;
    schemaFile: SchemaFile;
    initialValue: unknown;
    disabled?: boolean;
    Editor: Component<EditorProps>;

    controller?: (ctrl: EditorController | null) => void;
};

export type SchemaType =
    | 'object'
    | 'array'
    | 'number'
    | 'string'
    | 'bool'
    | 'const'
    | 'enum'
    | 'null'
    | 'oneOf'
    | 'allOf'
    | 'anyOf';
