import { type Component, createMemo } from 'solid-js';
import { BufferAttribute, BufferGeometry, LineBasicMaterial, LineLoop } from 'three';
import { City } from '@/domain/City';
import { World } from '@/domain/World';
import { type MeshBuilder } from '@/lib/3d/MeshBuilder';
import { getTilesOutline } from '@/lib/3d/utils';
import { dfCitiesByWorldId } from '@/store/datafront';
import { SceneObject } from '@/three/SceneObject/SceneObject';

type Props = {
    world: World | null;
    selectedTileId: string | undefined;
    surface: MeshBuilder | null;
};

const cityOutlineMat = new LineBasicMaterial({
    color: 0xd4d4f9,
    linewidth: 2,
});

export const PVSCityOutline: Component<Props> = (props) => {
    const worldCities = dfCitiesByWorldId.use(() => (props.world ? { worldId: props.world.id } : null));

    const outlinedCity = createMemo(() => {
        const cities = Object.values(worldCities.result());
        return cities.find((city) => City.hasClaimedTileId(city, props.selectedTileId));
    });

    const outline = createMemo(() => {
        const city = outlinedCity();
        const builder = props.surface;
        if (!city || !builder) {
            return null;
        }

        const tileIndicies = [...city.claimedTileIds, city.centerTileId].map((id) => World.parseTileId(id)!);
        const outlineCoords = getTilesOutline(builder, new Set(tileIndicies));

        const geom = new BufferGeometry();
        geom.setAttribute(
            'position',
            new BufferAttribute(new Float32Array(outlineCoords.flat().map((x) => x * 1.001)), 3),
        );

        const outline = new LineLoop(geom, cityOutlineMat);
        return outline;
    });

    return <SceneObject object={outline()} />;
};
