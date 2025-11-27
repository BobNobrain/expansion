import { sumPredictables, type Predictable } from '../lib/predictables';

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

export namespace City {
    export function getTotalPopulation(city: City): Predictable {
        return sumPredictables(Object.values(city.population.counts));
    }

    export function hasClaimedTileId(city: City, tileId: string | undefined): boolean {
        if (!tileId) {
            return false;
        }

        return tileId === city.centerTileId || city.claimedTileIds.includes(tileId);
    }
}

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

export type WorkforceData<T> = { [key in WorkforceType]?: T };

export namespace WorkforceData {
    export function empty<T>(): WorkforceData<T> {
        return {};
    }

    export function filled<T>(fill: T): WorkforceData<T> {
        return Object.fromEntries(WORKFORCE_TYPES.map((type) => [type, fill]));
    }

    export function mix<T, U>(
        target: WorkforceData<T>,
        mixin: WorkforceData<U>,
        mixer: (current: T | undefined, incoming: U) => T,
    ) {
        for (const [type, data] of Object.entries(mixin) as [WorkforceType, U][]) {
            target[type] = mixer(target[type], data);
        }
    }
}
