import { type RawColor, type RawVertex } from '../../lib/3d/types';
import { FULL_CIRCLE, H, INNER_R, MAX_DENSITY_AT, N_STARS, OUTER_R } from './constants';

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
        widthTheta: FULL_CIRCLE / 7,
        percentage: 0.15,
        twist: 3.1,
        color: [1, 0.3, 0.3],
    },
    {
        position: 0.19,
        widthTheta: FULL_CIRCLE / 7,
        percentage: 0.1,
        twist: 2.9,
        color: [1, 0.7, 0.3],
    },
    {
        position: 0.37,
        widthTheta: FULL_CIRCLE / 7,
        percentage: 0.1,
        twist: 3,
        color: [0.95, 0.95, 0.3],
    },
    {
        position: 0.54,
        widthTheta: FULL_CIRCLE / 10,
        percentage: 0.05,
        twist: 2.8,
        color: [0.5, 0.5, 1],
    },
    {
        position: 0.7,
        widthTheta: FULL_CIRCLE / 7,
        percentage: 0.1,
        twist: 3.1,
        color: [0.3, 0.1, 0.8],
    },
    {
        position: 0.87,
        widthTheta: FULL_CIRCLE / 100,
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
    const r = INNER_R + rnd * (OUTER_R - INNER_R);

    const thetaStrict = (rnd * FULL_CIRCLE) / sleeve.twist + sleeve.position * FULL_CIRCLE;

    const thetaVariated =
        thetaStrict + ((Math.random() * (1 - rnd / 2) * sleeve.widthTheta) / 2) * (Math.random() < 0.5 ? 1 : -1);

    const x = Math.cos(thetaVariated) * r;
    const z = Math.sin(thetaVariated) * r;
    const y = genY();
    return { pos: [x, y, z], color: sleeve.color };
};

const genScatterStar = (): Star => {
    const theta = Math.random() * FULL_CIRCLE;
    const r = INNER_R + sampleRndForR() * (OUTER_R - INNER_R);
    return { pos: [Math.cos(theta) * r, genY(), Math.sin(theta) * r], color: [1, 1, 1] };
};

export type GalaxyStars = {
    verticies: RawVertex[];
    colors: RawColor[];
};

export function generateStars(): GalaxyStars {
    const verticies: RawVertex[] = [];
    const colors: RawColor[] = [];

    for (let i = 0; i < N_STARS; i++) {
        const star = genSleeveStar() || genScatterStar();
        verticies.push(star.pos);
        // colors.push(star.color);
        colors.push(starColors[Math.floor(Math.random() * starColors.length)]);
    }

    return { verticies, colors };
}
