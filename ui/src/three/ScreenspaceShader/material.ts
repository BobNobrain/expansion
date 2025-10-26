import { type ShaderChunk, ShaderMaterial, Uniform, UniformsLib, UniformsUtils } from 'three';
import fragmentUtils from './screenspaceFragmentUtils.glsl';
import vertexShader from './screenspaceVertex.glsl';

export type ScreenspaceShaderMaterialOptions = {
    fragment: string;
    uniformDefs: string;
    uniforms: Record<string, Uniform>;
    lights: boolean;
};

export const UNIFORM_CAMERA_ASPECT = 'uCameraAspect';

export class ScreenspaceShaderMaterial extends ShaderMaterial {
    constructor({ fragment, uniforms, uniformDefs, lights }: ScreenspaceShaderMaterialOptions) {
        uniforms[UNIFORM_CAMERA_ASPECT] = new Uniform(1);
        if (lights) {
            Object.assign(uniforms, UniformsUtils.clone(UniformsLib.lights));
        }

        const includedChunks: (keyof typeof ShaderChunk)[] = [];
        if (lights) {
            includedChunks.push('common');
            includedChunks.push('lights_pars_begin');
        }

        const includes = includedChunks.map((name) => `#include <${name}>`);
        const fragmentShader = [
            ...includes,
            `varying vec2 vScreenPos;`,
            `uniform float ${UNIFORM_CAMERA_ASPECT};`,
            uniformDefs,
            fragmentUtils,
            fragment,
        ].join('\n');

        super({
            vertexShader,
            fragmentShader,
            transparent: true,
            lights,

            uniforms,
        });
    }

    setAspect(cameraAspect: number) {
        this.uniforms[UNIFORM_CAMERA_ASPECT].value = cameraAspect;
    }

    setUniformValues(values: Record<string, unknown>) {
        for (const [name, value] of Object.entries(values)) {
            this.uniforms[name].value = value;
        }
    }
}
