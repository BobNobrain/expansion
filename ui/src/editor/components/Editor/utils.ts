import { type Schema } from '../../../lib/jsonschema';
import { type SchemaType } from './types';

export function getSchemaType(s: Schema): SchemaType | undefined {
    if ('const' in s) {
        return 'const';
    }
    if ('enum' in s) {
        return 'enum';
    }

    if ('type' in s) {
        switch (s.type) {
            case 'integer':
                return 'number';

            default:
                return s.type;
        }
    }

    if ('oneOf' in s) {
        return 'oneOf';
    }
    if ('allOf' in s) {
        return 'allOf';
    }
    if ('anyOf' in s) {
        return 'anyOf';
    }

    return undefined;
}

export function isSimpleEditor(st: SchemaType): boolean {
    switch (st) {
        case 'bool':
        case 'string':
        case 'null':
        case 'number':
        case 'enum':
        case 'const':
            return true;

        default:
            return false;
    }
}
