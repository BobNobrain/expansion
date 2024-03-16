import { createEffect, type Component } from 'solid-js';
import { Mesh, PlaneGeometry } from 'three';
import { SceneObject } from '../../components/three/SceneObject/SceneObject';
import { GalaxyFogMaterial } from './GalaxyFogMaterial';
import { useSceneRenderer } from '../../components/three/context';

export type GalaxyFogProps = {
    innerR: number;
    outerR: number;
    maxH: number;
};

// const N_POINTS = 100;

export const GalaxyFog: Component<GalaxyFogProps> = (props) => {
    const { getBounds, getMainCamera } = useSceneRenderer();

    const mat = new GalaxyFogMaterial();
    mat.setDimensions(props);

    createEffect(() => {
        console.log(getMainCamera());
        const { width, height } = getBounds();
        mat.setAspect(width / height);
    });

    const quad = new Mesh(new PlaneGeometry(2, 2), mat);

    // const mat = galaxyFogMaterial;
    // const vs: RawVertex[] = [];

    // for (let i = 0; i < N_POINTS; i++) {
    //     const r = lerp(props.innerR, props.outerR, Math.random());
    //     const th = Math.PI * 2 * Math.random();
    //     const x = r * Math.cos(th);
    //     const z = r * Math.sin(th);
    //     const y = lerp(-props.maxH, props.maxH, Math.random());
    //     vs.push([x, y, z]);
    // }

    // const geom = new BufferGeometry();
    // geom.setAttribute('position', new BufferAttribute(new Float32Array(vs.flat()), 3));
    // const points = new Points(geom, mat);

    return <SceneObject object={quad} />;
};
