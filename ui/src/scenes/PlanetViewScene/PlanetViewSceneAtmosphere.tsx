import { Mesh, PlaneGeometry, ShaderMaterial, Uniform } from 'three';
import { type Component, createEffect, createMemo } from 'solid-js';
import { useSceneRenderer } from '../../components/three/context';
import { SceneObject } from '../../components/three/SceneObject/SceneObject';
import vertexShader from './atmosphereVertex.glsl';
import fragmentShader from './atmosphereFragment.glsl';

export type PlanetViewSceneAtmosphereProps = {
    isNatural: boolean;
    density: number;
};

export const PlanetViewSceneAtmosphere: Component<PlanetViewSceneAtmosphereProps> = (props) => {
    const { getBounds } = useSceneRenderer();

    const getQuad = createMemo(() => {
        if (!props.isNatural) {
            return null;
        }

        const mat = new AtmosphereMaterial(props);

        createEffect(() => {
            const { width, height } = getBounds();
            mat.setAspect(width / height);
        });

        const quad = new Mesh(new PlaneGeometry(2, 2), mat);
        return quad;
    });

    return <SceneObject object={getQuad()} />;
};

enum UniformName {
    Density = 'u_density',
    CameraAspect = 'u_cameraAspect',
}

const uniformsDefinitions = `
uniform float ${UniformName.Density};
uniform float ${UniformName.CameraAspect};
`;

class AtmosphereMaterial extends ShaderMaterial {
    constructor(props: PlanetViewSceneAtmosphereProps) {
        super({
            vertexShader,
            fragmentShader: `
                ${uniformsDefinitions}
                ${fragmentShader}
            `,
            transparent: true,
            uniforms: {
                [UniformName.Density]: new Uniform(props.density),
                [UniformName.CameraAspect]: new Uniform(1),
            },
        });
    }

    setAspect(cameraAspect: number) {
        this.uniforms[UniformName.CameraAspect].value = cameraAspect;
    }
}
