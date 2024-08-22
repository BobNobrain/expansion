export type ObjectWithSchema = {
    $schema: string;
};

export type InformativeFields = {
    title?: string;
    description?: string;
    editorHints?: EditorHints;
    default?: unknown;
};

export type EditorHints = {
    component?: string;
    kinds?: string[];
};

export type ObjectSchema = {
    type: 'object';
    properties: Record<string, Schema>;
    required?: string[];
    additionalProperties?: boolean;
};

export type ArraySchema = {
    type: 'array';
    items: Schema;
    minItems?: number;
    maxItems?: number;
};

export type NumberSchema = {
    type: 'number' | 'integer';
    minumum?: number;
    maximum?: number;
    exclusiveMinumum?: number;
    exclusiveMaximum?: number;
    multipleOf?: number;
};

export type StringSchema = {
    type: 'string';
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    format?: string;
};

export type EnumSchema = {
    enum: unknown[];
};
export type ConstantSchema = {
    const: unknown;
};
export type NullSchema = {
    type: 'null';
};

export type RefSchema = {
    $ref: string;
};

export type AllOfSchema = {
    allOf: Schema[];
};
export type AnyOfSchema = {
    anyOf: Schema[];
};
export type OneOfSchema = {
    oneOf: Schema[];
};

type SchemaOptions =
    | ObjectSchema
    | ArraySchema
    | NumberSchema
    | StringSchema
    | EnumSchema
    | ConstantSchema
    | NullSchema
    | RefSchema
    | AllOfSchema
    | AnyOfSchema
    | OneOfSchema;

export type Schema = SchemaOptions & InformativeFields;

export type SchemaFile = Schema & {
    $schema?: string;
    $defs?: Record<string, Schema>;
};
