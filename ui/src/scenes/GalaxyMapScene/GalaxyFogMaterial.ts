import { ShaderMaterial, type Texture, Uniform } from 'three';
import vertexShader from './galaxyFogVertex.glsl';
import fragmentProgram from './galaxyFogFragment.glsl';

// three built-ins for shaders:
// https://threejs.org/docs/index.html#api/en/renderers/webgl/WebGLProgram

enum UniformName {
    InnerR = 'u_innerR',
    OuterR = 'u_outerR',
    MaxH = 'u_maxH',
    CameraAspect = 'u_cameraAspect',

    GalaxyTexture = 'u_galaxyTex',
    TotalBrightness = 'u_totalBrightness',
    SightSamplingGranularity = 'u_samplingGranularity',
    NoiseLayers = 'u_noiseLayers',
}

const uniformsDefinition = `
uniform float ${UniformName.InnerR};
uniform float ${UniformName.OuterR};
uniform float ${UniformName.MaxH};
uniform float ${UniformName.CameraAspect};

uniform sampler2D ${UniformName.GalaxyTexture};
uniform float ${UniformName.TotalBrightness};
uniform float ${UniformName.SightSamplingGranularity};

struct NoiseLayer {
    float gridSize;
    float multiplier;
};

uniform NoiseLayer[N_NOISE_LAYERS] ${UniformName.NoiseLayers};
`;

const fragmentShader = (nNoiseLayers: number) => `
const int N_NOISE_LAYERS = ${nNoiseLayers};
${uniformsDefinition}
${fragmentProgram}
`;

export type NoiseLayer = {
    gridSize: number;
    multiplier: number;
};

export type GalaxyFogDimensions = {
    innerR: number;
    outerR: number;
    maxH: number;
};

export class GalaxyFogMaterial extends ShaderMaterial {
    constructor(tx: Texture, noiseLayers: NoiseLayer[]) {
        if (!noiseLayers.length) {
            noiseLayers.push({ gridSize: 0, multiplier: 0 });
        }

        super({
            vertexShader,
            fragmentShader: fragmentShader(noiseLayers.length), // glsl arrays can't be of 0 length
            depthTest: false,
            depthWrite: false,
            uniforms: {
                [UniformName.InnerR]: new Uniform(0),
                [UniformName.OuterR]: new Uniform(1),
                [UniformName.MaxH]: new Uniform(1),
                [UniformName.CameraAspect]: new Uniform(1),
                [UniformName.GalaxyTexture]: new Uniform(tx),
                [UniformName.TotalBrightness]: new Uniform(50.0),
                [UniformName.SightSamplingGranularity]: new Uniform(0.04),
                [UniformName.NoiseLayers]: new Uniform(noiseLayers),
            },
        });
    }

    setDimensions(dims: GalaxyFogDimensions) {
        this.uniforms[UniformName.InnerR].value = dims.innerR;
        this.uniforms[UniformName.OuterR].value = dims.outerR;
        this.uniforms[UniformName.MaxH].value = dims.maxH;
    }

    setAspect(cameraAspect: number) {
        this.uniforms[UniformName.CameraAspect].value = cameraAspect;
    }

    setBrightness(multiplier: number) {
        this.uniforms[UniformName.TotalBrightness].value = multiplier;
    }

    setSamplingGranularity(dk: number) {
        this.uniforms[UniformName.SightSamplingGranularity].value = dk;
    }
}
