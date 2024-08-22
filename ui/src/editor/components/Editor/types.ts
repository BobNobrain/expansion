import { type Component } from 'solid-js';
import { type InformativeFields, type JSONPath, type SchemaFile } from '../../../lib/jsonschema';

export type EditorProps = {
    // value: unknown;
    schemaFile: SchemaFile;
    path: JSONPath;
    getLens: <T>(path: JSONPath) => [() => T, (x: T) => void];
};

export type EditorComponentProps<Schema> = {
    // value: Value;
    getLens: <T>(path: JSONPath) => [() => T, (x: T) => void];
    schema: Schema & InformativeFields;
    path: JSONPath;
    schemaFile: SchemaFile;
    Editor: Component<EditorProps>;
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
