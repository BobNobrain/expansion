import { type Component, createEffect } from 'solid-js';
import { Mesh, PlaneGeometry, Uniform } from 'three';
import { useSceneRenderer } from '../../../components/three/context';
import { useInScene } from '../../../components/three/hooks/useInScene';
import { ScreenspaceShaderMaterial } from './material';
import { type ReactiveUniformsDef } from './uniforms';

export type ScreenspaceShaderProps = {
    /**
     * A GLSL program for fragment shader. Needed uniform definitions, as well as some utilities specific for
     * screen-space shaders, will be included before the program text.
     */
    program: string;
    /** All uniforms that are used in fragment shader; values are updated reactively, but the list itself should not change */
    uniforms?: ReactiveUniformsDef;
    /**
     * If the shader will be rendered
     * @default true
     */
    enabled?: boolean;

    /**
     * If should include light-related uniforms
     * @default false
     */
    usesLights?: boolean;
};

export const ScreenspaceShader: Component<ScreenspaceShaderProps> = (props) => {
    const { getBounds } = useSceneRenderer();

    const uniformDefs = props.uniforms
        ? Object.entries(props.uniforms)
              .map(([name, def]) => `uniform ${def.type} ${name};`)
              .join(';\n')
        : '';
    const uniforms = props.uniforms
        ? Object.entries(props.uniforms).reduce<Record<string, Uniform>>((acc, [name, def]) => {
              acc[name] = new Uniform(def.value());
              return acc;
          }, {})
        : {};

    const material = new ScreenspaceShaderMaterial({
        fragment: props.program,
        uniformDefs,
        uniforms,
        lights: props.usesLights ?? false,
    });

    if (props.uniforms) {
        createEffect(() => {
            const values = Object.entries(props.uniforms!).reduce<Record<string, unknown>>((acc, [name, def]) => {
                acc[name] = def.value();
                return acc;
            }, {});

            material.setUniformValues(values);
        });
    }

    createEffect(() => {
        const { width, height } = getBounds();
        material.setAspect(width / height);
    });

    const quad = new Mesh(new PlaneGeometry(2, 2), material);
    quad.name = 'ScreenspaceShader_quad';
    useInScene(() => (props.enabled === false ? null : quad));

    return null;
};
