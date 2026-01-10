/* eslint-disable @typescript-eslint/no-explicit-any */

import { useParams } from '@solidjs/router';
import { createMemo } from 'solid-js';

/* eslint-disable @typescript-eslint/ban-types */
export type RouteParams<Template extends string> = string extends Template
    ? { [key in string]?: string }
    : {
          [key in ExtractParams<Template>]?: string;
      };

type ExtractParams<T extends string> = T extends `${string}/:${infer ParamName}/${infer Rest}`
    ? RemoveQuestion<ParamName> | ExtractParams<`/${Rest}`>
    : T extends `${string}/:${infer ParamName}`
    ? RemoveQuestion<ParamName>
    : never;

type RemoveQuestion<Name extends string> = Name extends `${infer N}?` ? N : Name;
type SkipIfWithQuestion<Name extends string> = Name extends `${string}?` ? never : Name;
type SkipIfWithoutQuestion<Name extends string> = Name extends `${infer N}?` ? N : never;

type ExtractOptionalParams<T extends string> = T extends `${string}/:${infer ParamName}/${infer Rest}`
    ? SkipIfWithoutQuestion<ParamName> | ExtractOptionalParams<`/${Rest}`>
    : T extends `${string}/:${infer ParamName}`
    ? SkipIfWithoutQuestion<ParamName>
    : never;

type ExtractRequiredParams<T extends string> = T extends `${string}/:${infer ParamName}/${infer Rest}`
    ? SkipIfWithQuestion<ParamName> | ExtractRequiredParams<`/${Rest}`>
    : T extends `${string}/:${infer ParamName}`
    ? SkipIfWithQuestion<ParamName>
    : never;

type ParamDefinition<T> = {
    defaultValue: T;
    parse: (value: string) => T | null;
    stringify?: (value: T) => string;
};

export function createRouteTemplate<
    Template extends string,
    Params extends {
        [Key in ExtractParams<Template>]: any;
    },
>(
    template: Template,
    defs: {
        [Key in keyof Params]: ParamDefinition<Params[Key]>;
    },
) {
    const parse = (
        params: Partial<Record<string, string>>,
    ): {
        [Key in ExtractParams<Template>]: Params[Key];
    } => {
        const result: Record<string, unknown> = {};
        for (const key of Object.keys(defs)) {
            if (defs[key as never]) {
                const strValue = params[key];
                const paramDef = defs[key as never] as ParamDefinition<keyof Params>;
                if (strValue === undefined) {
                    result[key] = paramDef.defaultValue;
                } else {
                    result[key] = paramDef.parse(strValue) ?? paramDef.defaultValue;
                }
            } else {
                result[key] = params[key] as never;
            }
        }

        return result as never;
    };

    const fragments = template.split('/');
    const render = (
        params: {
            [Key in ExtractRequiredParams<Template> & keyof Params]: Params[Key];
        } & {
            [Key in ExtractOptionalParams<Template>]?: Params[Key];
        },
    ) => {
        return (
            '/' +
            fragments
                .map((fragment) => {
                    if (fragment[0] !== ':') {
                        return fragment;
                    }

                    const name = fragment.endsWith('?')
                        ? fragment.substring(1, fragment.length - 1)
                        : fragment.substring(1);
                    return params[name as never];
                })
                .filter(Boolean as unknown as <T>(t: T | undefined) => t is T)
                .join('/')
        );
    };

    return { template, parse, render };
}

export const stringParam: ParamDefinition<string> = {
    defaultValue: '',
    parse: String,
};

export const integerParam: ParamDefinition<number> = {
    defaultValue: 0,
    parse: (input: string | undefined) => {
        if (!input) {
            return 0;
        }

        const n = Number.parseInt(input);
        if (Number.isNaN(n)) {
            return 0;
        }

        return n;
    },
};

export const enumParam = <T extends string>(values: T[]): ParamDefinition<T> => {
    return {
        defaultValue: values[0],
        parse: (value) => {
            if (!values.includes(value as T)) {
                return values[0];
            }
            return value as T;
        },
    };
};

export function useRouteInfo<T>(routeTemplate: { parse: (params: Partial<Record<string, string>>) => T }): () => T {
    const params = useParams();
    return createMemo(() => routeTemplate.parse(params));
}
