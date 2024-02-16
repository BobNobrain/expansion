import { type Component } from 'solid-js';
import * as T from 'three';
import { type RawColor, type RawVertex } from '../../lib/3d/types';
import { useInScene } from '../../components/three/hooks/useInScene';
import { RotatableCamera } from '../common/RotatableCamera/RotatableCamera';

const FULL_ANGLE = 2 * Math.PI;
const N = 10000;
const R = 2;
const MAX_DENSITY_AT = 0.05;
const H = 0.1;
const INNER_R = 0.5;

type SleeveConfig = {
    position: number;
    widthTheta: number;
    percentage: number;
    twist: number;
    color: RawColor;
};

type Star = {
    pos: RawVertex;
    color: RawColor;
};

const starColors: RawColor[] = [
    [1, 0.3, 0.3],
    [1, 0.7, 0.3],
    [0.95, 0.95, 0.3],
    [0.5, 0.5, 1],
    [0.3, 0.1, 0.8],
    [0.8, 0.3, 1],
    [1, 1, 1],
    [0.9, 1, 0.5],
    [1, 1, 0.9],
    [0.9, 0.8, 0.6],
];

const sleeves: SleeveConfig[] = [
    {
        position: 0,
        widthTheta: FULL_ANGLE / 7,
        percentage: 0.15,
        twist: 3.1,
        color: [1, 0.3, 0.3],
    },
    {
        position: 0.19,
        widthTheta: FULL_ANGLE / 7,
        percentage: 0.1,
        twist: 2.9,
        color: [1, 0.7, 0.3],
    },
    {
        position: 0.37,
        widthTheta: FULL_ANGLE / 7,
        percentage: 0.1,
        twist: 3,
        color: [0.95, 0.95, 0.3],
    },
    {
        position: 0.54,
        widthTheta: FULL_ANGLE / 10,
        percentage: 0.05,
        twist: 2.8,
        color: [0.5, 0.5, 1],
    },
    {
        position: 0.7,
        widthTheta: FULL_ANGLE / 7,
        percentage: 0.1,
        twist: 3.1,
        color: [0.3, 0.1, 0.8],
    },
    {
        position: 0.87,
        widthTheta: FULL_ANGLE / 100,
        percentage: 0.01,
        twist: 3,
        color: [0.8, 0.3, 1],
    },
];

const pickSleeve = (): SleeveConfig | null => {
    const rnd = Math.random();
    let acc = 0;
    for (const s of sleeves) {
        acc += s.percentage;
        if (rnd < acc) {
            return s;
        }
    }
    return null;
};

const genY = () => {
    const h = Math.random() * Math.random() * H;
    return Math.random() > 0.5 ? h : -h;
};

const sampleRndForR = () => {
    const rnd = Math.random() * Math.random();
    if (Math.random() < MAX_DENSITY_AT) {
        return MAX_DENSITY_AT * (1 - rnd);
    }
    return rnd * (1 - MAX_DENSITY_AT) + MAX_DENSITY_AT;
};

const genSleeveStar = (): Star | null => {
    const sleeve = pickSleeve();
    if (!sleeve) {
        return null;
    }

    const rnd = sampleRndForR();
    const r = INNER_R + rnd * (R - INNER_R);

    const thetaStrict = (rnd * FULL_ANGLE) / sleeve.twist + sleeve.position * FULL_ANGLE;

    const thetaVariated =
        thetaStrict + ((Math.random() * (1 - rnd / 2) * sleeve.widthTheta) / 2) * (Math.random() < 0.5 ? 1 : -1);

    const x = Math.cos(thetaVariated) * r;
    const z = Math.sin(thetaVariated) * r;
    const y = genY();
    return { pos: [x, y, z], color: sleeve.color };
};

const genScatterStar = (): Star => {
    const theta = Math.random() * FULL_ANGLE;
    const r = INNER_R + sampleRndForR() * (R - INNER_R);
    return { pos: [Math.cos(theta) * r, genY(), Math.sin(theta) * r], color: [1, 1, 1] };
};

export const GalaxyMapScene: Component = () => {
    const material = new T.PointsMaterial({
        color: 0xffffff,
        size: 1,
        sizeAttenuation: false,
        fog: false,
        vertexColors: true,
    });

    const verticies: RawVertex[] = [];
    const colors: RawColor[] = [];

    for (let i = 0; i < N; i++) {
        const star = genSleeveStar() || genScatterStar();
        verticies.push(star.pos);
        // colors.push(star.color);
        colors.push(starColors[Math.floor(Math.random() * starColors.length)]);
    }

    console.log('regen', verticies.length);

    const geom = new T.BufferGeometry();
    geom.setAttribute('position', new T.BufferAttribute(new Float32Array(verticies.flat()), 3));
    geom.setAttribute('color', new T.BufferAttribute(new Float32Array(colors.flat()), 3));

    const stars = new T.Points(geom, material);
    useInScene(() => stars);

    return (
        <>
            <RotatableCamera main minDistance={0.1} maxDistance={4} yawInertia={0.95} pitchInertia={0.9} />
        </>
    );
};
