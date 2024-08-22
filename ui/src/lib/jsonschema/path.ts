import { type ArraySchema, type ObjectSchema, type Schema, type SchemaFile } from './types';

export type JSONPath = (string | number)[];

export function deepGet(root: unknown, path: JSONPath): unknown {
    for (const segment of path) {
        if (!root || typeof root !== 'object') {
            return undefined;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        root = (root as any)[segment];
    }
    return root;
}

export function deepSet(root: unknown, path: JSONPath, value: unknown): void {
    const last = path.pop()!;
    for (const segment of path) {
        if (!root || typeof root !== 'object') {
            return undefined;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        root = (root as any)[segment];
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    (root as any)[last] = value;
}

const COMMON_PREFIX = '#/$defs/';

export function resolveSchemaRef(file: SchemaFile, ref: string): Schema {
    if (!ref.startsWith(COMMON_PREFIX)) {
        throw new ReferenceError(`Unknown JSON Schema ref: '${ref}'`);
    }

    if (!file.$defs) {
        throw new ReferenceError('Schema file does not contain $defs section!');
    }

    const key = ref.substring(COMMON_PREFIX.length);
    return file.$defs[key];
}

export function valuePathToSchemaPath(valuePath: JSONPath): JSONPath {
    const schemaPath: JSONPath = [];
    for (const segment of valuePath) {
        switch (typeof segment) {
            case 'string':
                schemaPath.push('properties', segment);
                break;
            case 'number':
                schemaPath.push('items');
                break;
        }
    }
    return schemaPath;
}

export function getSchemaForPath(file: SchemaFile, valuePath: JSONPath): Schema {
    let result: Schema = file;

    for (const segment of valuePath) {
        while ('$ref' in result) {
            const { $ref, ...rest } = result;
            result = { ...rest, ...resolveSchemaRef(file, $ref) };
        }

        if (typeof segment === 'number') {
            result = (result as ArraySchema).items;
        } else {
            result = (result as ObjectSchema).properties[segment];
        }
    }

    while ('$ref' in result) {
        const { $ref, ...rest } = result;
        result = { ...rest, ...resolveSchemaRef(file, $ref) };
    }

    return result;
}
