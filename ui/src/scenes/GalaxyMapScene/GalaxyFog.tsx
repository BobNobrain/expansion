import { createEffect, type Component, createSignal, createMemo } from 'solid-js';
import { Mesh, PlaneGeometry, type Texture, TextureLoader } from 'three';
import { SceneObject } from '../../components/three/SceneObject/SceneObject';
import { useSceneRenderer } from '../../components/three/context';
import { GraphicsQuality, useDeviceSettings } from '../../store/settings';
import { GalaxyFogMaterial, type NoiseLayer } from './GalaxyFogMaterial';

export type GalaxyFogProps = {
    innerR: number;
    outerR: number;
    maxH: number;
};

export const GalaxyFog: Component<GalaxyFogProps> = (props) => {
    const { getBounds } = useSceneRenderer();
    const [getTx, setTx] = createSignal<Texture | null>(null);

    const deviceSettings = useDeviceSettings();

    let txSize: string;
    const noiseLayers: NoiseLayer[] = [];
    switch (deviceSettings.settings.graphicsQuality) {
        case GraphicsQuality.Low:
            txSize = '128';
            break;

        case GraphicsQuality.Medium:
            txSize = '256';
            noiseLayers.push({ gridSize: 0.1, multiplier: 1 });
            break;

        case GraphicsQuality.High:
            txSize = '512';
            noiseLayers.push({ gridSize: 0.1, multiplier: 0.8 });
            noiseLayers.push({ gridSize: 0.03, multiplier: 0.2 });
            break;
    }

    const txLoader = new TextureLoader();
    txLoader.load(`/tx/galaxy-${txSize}.png`, setTx);

    const getQuad = createMemo(() => {
        const tx = getTx();
        if (!tx) {
            return null;
        }

        const mat = new GalaxyFogMaterial(tx, noiseLayers);
        mat.setDimensions(props);

        switch (deviceSettings.settings.graphicsQuality) {
            case GraphicsQuality.Low:
                mat.setSamplingGranularity(0.1);
                break;

            case GraphicsQuality.Medium:
                mat.setSamplingGranularity(0.07);
                break;

            case GraphicsQuality.High:
                mat.setSamplingGranularity(0.04);
                break;
        }

        createEffect(() => {
            const { width, height } = getBounds();
            mat.setAspect(width / height);
        });

        const quad = new Mesh(new PlaneGeometry(2, 2), mat);
        quad.renderOrder = -1;
        return quad;
    });

    // TODO: use ScreenspaceShader
    return <SceneObject object={getQuad()} />;
};
