import { ShaderMaterial, Uniform, Vector3 } from 'three';

// three built-ins for shaders:
// https://threejs.org/docs/index.html#api/en/renderers/webgl/WebGLProgram

enum UniformName {
    InnerR = 'innerR',
    OuterR = 'outerR',
    MaxH = 'maxH',
    CameraAspect = 'cameraAspect',

    PointSize = 'pointSize',
    PointBrightness = 'pointBrightness',

    TargetPoints = 'targets',
}

const N_POINTS = 6;

const uniformsDefinition = `
uniform float ${UniformName.InnerR};
uniform float ${UniformName.OuterR};
uniform float ${UniformName.MaxH};
uniform float ${UniformName.CameraAspect};
uniform float ${UniformName.PointSize};
uniform float ${UniformName.PointBrightness};
uniform vec3[${N_POINTS}] ${UniformName.TargetPoints};
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
varying vec2 vUv;

vec3 onViewLine(vec3 origin, vec3 forward, float k) {
    return k * forward + (1.0 - k) * origin;
}

vec2 getClosestPointToSight(vec3 origin, vec3 forward, vec3 target) {
    vec3 fo = origin - forward;
    vec3 to = origin - target;
    float k = dot(fo, to) / dot(fo, fo);

    if (k <= 0.0) {
        // clipping off
        return vec2(-1.0, k);
    }

    vec3 closestPoint = k * forward + (1.0 - k) * origin;
    float d = length(closestPoint - target);
    return vec2(d, k);
}

float calcBrightness(vec2 casted) {
    if (casted[1] <= 0.0) {
        return 0.0;
    }

    float exponential = exp(-casted[0] / ${UniformName.PointSize});
    float scaled = ${UniformName.PointBrightness} * exponential;

    if (casted[1] < 0.1) {
        // smoothing camera clipping
        return scaled * casted[1] / 0.1;
    }

    return scaled;
}

void main() {
    vec2 screenCoords = vUv * 2.0 - 1.0;
    screenCoords.x *= ${UniformName.CameraAspect};
    vec4 camView = vec4(screenCoords, -1.0, 0.0) * viewMatrix;

    // a & b are 2 points we need to define a line of sight
    vec3 origin = vec3(cameraPosition);
    vec3 forward = origin + normalize(vec3(camView));

    float brightness = 0.0;

    for (int i = 0; i < ${N_POINTS}; i++) {
        vec2 casted = getClosestPointToSight(origin, forward, ${UniformName.TargetPoints}[i]);
        float b = calcBrightness(casted);
        brightness += b;
        if (brightness >= 1.0) {
            brightness = 1.0;
            break;
        }
    }

    gl_FragColor = vec4(brightness, brightness, brightness, 1.0);
}
`;

// line: a in line, b in line, => line: k(a-b)

export type GalaxyFogDimensions = {
    innerR: number;
    outerR: number;
    maxH: number;
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

    setPointSize(size: number) {
        this.uniforms[UniformName.PointSize].value = size;
    }
}
