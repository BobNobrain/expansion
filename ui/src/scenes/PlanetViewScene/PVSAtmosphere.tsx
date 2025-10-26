import { type Component } from 'solid-js';
import { ScreenspaceShader, u } from '@/three/ScreenspaceShader';
import fragmentShader from './atmosphere.glsl';

export type PVSAtmosphereProps = {
    isNatural: boolean;
    density: number;
};

export const PVSAtmosphere: Component<PVSAtmosphereProps> = (props) => {
    return (
        <ScreenspaceShader
            enabled={props.isNatural}
            program={fragmentShader}
            usesLights
            uniforms={{
                uDensity: u.float(() => props.density),
            }}
        />
    );
};
