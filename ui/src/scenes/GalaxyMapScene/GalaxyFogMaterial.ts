import { ShaderMaterial, Uniform, Vector3 } from 'three';
import fragmentProgram from './galaxyFogFragment.glsl';

// three built-ins for shaders:
// https://threejs.org/docs/index.html#api/en/renderers/webgl/WebGLProgram

enum UniformName {
    InnerR = 'u_innerR',
    OuterR = 'u_outerR',
    MaxH = 'u_maxH',
    CameraAspect = 'u_cameraAspect',

    PointSize = 'u_pointSize',
    PointBrightness = 'u_pointBrightness',

    TargetPoints = 'u_targetPoints',
    Sleeves = 'u_sleeves',
}

const N_POINTS = 6;
const N_SLEEVES = 1;

const uniformsDefinition = `
uniform float ${UniformName.InnerR};
uniform float ${UniformName.OuterR};
uniform float ${UniformName.MaxH};
uniform float ${UniformName.CameraAspect};
uniform float ${UniformName.PointSize};
uniform float ${UniformName.PointBrightness};
uniform vec3[${N_POINTS}] ${UniformName.TargetPoints};

struct Sleeve {
    float thPos;
    float thWidth;
    float thTwist;
    float density;
};

uniform Sleeve[${N_SLEEVES}] ${UniformName.Sleeves};
`;

const vertexShader = `
${uniformsDefinition}
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
${uniformsDefinition}
#define N_POINTS ${N_POINTS}
#define N_SLEEVES ${N_SLEEVES}
${fragmentProgram}
`;

export type GalaxyFogDimensions = {
    innerR: number;
    outerR: number;
    maxH: number;
};

type SleeveConfig = {
    thPos: number;
    thWidth: number;
    thTwist: number;
    density: number;
};

export class GalaxyFogMaterial extends ShaderMaterial {
    constructor() {
        super({
            vertexShader,
            fragmentShader,
            depthTest: false,
            depthWrite: false,
            uniforms: {
                [UniformName.InnerR]: new Uniform(0),
                [UniformName.OuterR]: new Uniform(1),
                [UniformName.MaxH]: new Uniform(1),
                [UniformName.CameraAspect]: new Uniform(1),
                [UniformName.PointSize]: new Uniform(0.2),
                [UniformName.PointBrightness]: new Uniform(0.2),
                [UniformName.TargetPoints]: new Uniform([
                    new Vector3(0, 0, 0),
                    new Vector3(1, 0, 0),
                    new Vector3(0, 0, 1),
                    new Vector3(0.1, 0, 0.1),
                    new Vector3(0.2, 0, 0.2),
                    new Vector3(0.3, 0, 0.3),
                ]),
                [UniformName.Sleeves]: new Uniform<SleeveConfig[]>([
                    { thPos: 0, thWidth: (Math.PI * 2) / 7, thTwist: 3.1, density: 0.15 },
                ]),
            },
        });
    }

    setDimensions(dims: GalaxyFogDimensions) {
        this.uniforms[UniformName.InnerR].value = dims.innerR;
        this.uniforms[UniformName.OuterR].value = dims.outerR;
        this.uniforms[UniformName.MaxH].value = dims.maxH;
    }

    setAspect(cameraAspect: number) {
        console.log({ cameraAspect });
        this.uniforms[UniformName.CameraAspect].value = cameraAspect;
    }

    setPointSize(size: number) {
        this.uniforms[UniformName.PointSize].value = size;
    }
}
