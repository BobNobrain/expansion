import { createMemo, type Component, createEffect } from 'solid-js';
import * as T from 'three';
import { type RawColor, type RawVertex } from '../../lib/3d/types';
import { Star } from '../../domain/Star';
import { SceneObject } from '../../components/three/SceneObject/SceneObject';
import { GalacticCoords } from '../../domain/GalacticCoords';
import { useAnimatedNumber } from '../../components/three/hooks/useAnimatedValue';

export type GalaxyStarsProps = {
    stars: Pick<Star, 'coords' | 'tempK'>[];
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

    const normalBasesMaterial = new T.PointsMaterial({
        color: 0xffffff,
        size: 1,
        sizeAttenuation: false,
        fog: false,
        transparent: true,
    });

    const normalsMaterial = new T.LineBasicMaterial({
        color: 0x808080,
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
        normalBasesMaterial.opacity = op;
        normalsMaterial.opacity = op;
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
        const normalBasesGeom = new T.BufferGeometry();
        normalBasesGeom.setAttribute(
            'position',
            new T.BufferAttribute(new Float32Array(normalBasePositions.flat()), 3),
        );
        const normalBases = new T.Points(normalBasesGeom, normalBasesMaterial);

        const normalsPositions = new Array<RawVertex>(positions.length * 2);
        for (let i = 0; i < positions.length; i++) {
            normalsPositions[i * 2] = positions[i];
            normalsPositions[i * 2 + 1] = normalBasePositions[i];
        }
        const normalsGeom = new T.BufferGeometry();
        normalsGeom.setAttribute('position', new T.BufferAttribute(new Float32Array(normalsPositions.flat()), 3));
        const normals = new T.LineSegments(normalsGeom, normalsMaterial);

        const everything = new T.Group();
        everything.add(normalBases);
        everything.add(stars);
        everything.add(normals);

        return everything;
    });

    return <SceneObject object={stars()} />;
};
