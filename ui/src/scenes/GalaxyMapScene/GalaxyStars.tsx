import { createMemo, type Component, createEffect } from 'solid-js';
import * as T from 'three';
import { type RawColor, type RawVertex } from '../../lib/3d/types';
import { Star, type StarWithCoords } from '../../domain/Star';
import { SceneObject } from '../../components/three/SceneObject/SceneObject';
import { GalacticCoords } from '../../domain/GalacticCoords';
import { useAnimatedNumber } from '../../components/three/hooks/useAnimatedValue';

export type GalaxyStarsProps = {
    stars: Pick<StarWithCoords, 'coords' | 'tempK'>[];
    withNormals?: boolean;
    dim?: boolean;
};

export const GalaxyStars: Component<GalaxyStarsProps> = (props) => {
    const starsMaterial = new T.PointsMaterial({
        size: 2,
        sizeAttenuation: false,
        fog: false,
        vertexColors: true,
        transparent: true,
    });

    const normalsUpMaterial = new T.LineBasicMaterial({
        color: 0x4080ff,
        transparent: true,
    });
    const normalsDownMaterial = new T.LineBasicMaterial({
        color: 0xff8040,
        transparent: true,
    });

    const opacity = useAnimatedNumber({
        target: () => (props.dim ? 0.3 : 1),
        durationMs: 350,
        eps: 1e-2,
    });

    createEffect(() => {
        const op = opacity();

        starsMaterial.opacity = op;
        normalsUpMaterial.opacity = 0.75 * op;
        normalsDownMaterial.opacity = 0.75 * op;
    });

    const stars = createMemo(() => {
        const starsList = props.stars;

        const positions = starsList.map((star): RawVertex => GalacticCoords.toXYZ(star.coords));
        const colors = starsList.map((star): RawColor => Star.getColor(star));

        const starsGeom = new T.BufferGeometry();
        starsGeom.setAttribute('position', new T.BufferAttribute(new Float32Array(positions.flat()), 3));
        starsGeom.setAttribute('color', new T.BufferAttribute(new Float32Array(colors.flat()), 3));

        const stars = new T.Points(starsGeom, starsMaterial);

        if (!props.withNormals) {
            return stars;
        }

        const normalBasePositions = positions.map(([x, _, z]): RawVertex => [x, 0, z]);

        const normalsUpPositions: RawVertex[] = [];
        const normalsDownPositions: RawVertex[] = [];
        for (let i = 0; i < positions.length; i++) {
            const point = positions[i];
            const base = normalBasePositions[i];

            if (point[1] < 0) {
                normalsDownPositions.push(point);
                normalsDownPositions.push(base);
            } else {
                normalsUpPositions.push(point);
                normalsUpPositions.push(base);
            }
        }

        const normalsUpGeom = new T.BufferGeometry();
        normalsUpGeom.setAttribute('position', new T.BufferAttribute(new Float32Array(normalsUpPositions.flat()), 3));
        const normalsUp = new T.LineSegments(normalsUpGeom, normalsUpMaterial);

        const normalsDownGeom = new T.BufferGeometry();
        normalsDownGeom.setAttribute(
            'position',
            new T.BufferAttribute(new Float32Array(normalsDownPositions.flat()), 3),
        );
        const normalsDown = new T.LineSegments(normalsDownGeom, normalsDownMaterial);

        const everything = new T.Group();
        everything.add(stars);
        everything.add(normalsUp);
        everything.add(normalsDown);

        return everything;
    });

    return <SceneObject object={stars()} />;
};
