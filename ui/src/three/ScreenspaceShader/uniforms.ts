import { type Texture } from 'three';

export type ReactiveFloatUniform = {
    type: 'float';
    value: () => number;
};
export type ReactiveIntUniform = {
    type: 'int';
    value: () => number;
};
export type ReactiveVec2Uniform = {
    type: 'vec2';
    value: () => [number, number];
};
export type ReactiveVec3Uniform = {
    type: 'vec3';
    value: () => [number, number, number];
};
export type ReactiveVec4Uniform = {
    type: 'vec4';
    value: () => [number, number, number, number];
};
export type ReactiveSampler2DUniform = {
    type: 'sampler2D';
    value: () => Texture;
};

export type ReactiveUniform =
    | ReactiveFloatUniform
    | ReactiveIntUniform
    | ReactiveVec2Uniform
    | ReactiveVec3Uniform
    | ReactiveVec4Uniform
    | ReactiveSampler2DUniform;

export type ReactiveUniformsDef = Record<string, ReactiveUniform>;

export function float(value: () => number): ReactiveFloatUniform {
    return { type: 'float', value };
}

export function int(value: () => number): ReactiveIntUniform {
    return { type: 'int', value };
}

// TBD: other uniform types
