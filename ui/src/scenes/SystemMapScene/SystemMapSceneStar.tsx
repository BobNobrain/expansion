import { type Component, createMemo, createEffect } from 'solid-js';
import * as T from 'three';
import { Orbit } from '@/domain/Orbit';
import { Star } from '@/domain/Star';
import { useInScene } from '@/three/hooks/useInScene';

export type SystemMapSceneStarProps = {
    star: Star;
    orbit: Orbit | null;
};

export const SystemMapSceneStar: Component<SystemMapSceneStarProps> = (props) => {
    const star = createMemo(() => {
        const starData = props.star;
        const starColor = new T.Color(...Star.getColor(starData));
        const mat = new T.MeshPhongMaterial({ color: starColor, emissive: starColor });
        const geom = new T.SphereGeometry(starData.radiusAu * 100);
        const star = new T.Mesh(geom, mat);

        return star;
    });

    createEffect(() => {
        const object = star();
        if (props.orbit) {
            object.position.set(...Orbit.coordsFromTrueAnomaly(props.orbit, 0));
        } else {
            object.position.set(0, 0, 0);
        }

        console.log('star orbit is', props.star.id, { ...props.orbit });
    });

    useInScene(star);

    return null;
};
