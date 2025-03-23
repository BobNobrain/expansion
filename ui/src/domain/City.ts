import type { Predictable } from '../lib/predictables';

export type City = {
    id: number;
    worldId: string;
    centerTileId: string;
    claimedTileIds: string[];

    name: string;
    founder: string;
    established: Date;

    population: {
        counts: Record<WorkforceType, Predictable>;
    };

    buildings: Record<string, number>;
};

export type WorkforceType =
    | 'intern'
    | 'worker'
    | 'foreman'
    | 'manager'
    | 'clevel'
    | 'engineer'
    | 'senior'
    | 'researcher'
    | 'scientist';

export const WORKFORCE_TYPES: WorkforceType[] = [
    'intern',
    'worker',
    'foreman',
    'manager',
    'clevel',
    'engineer',
    'senior',
    'researcher',
    'scientist',
];
