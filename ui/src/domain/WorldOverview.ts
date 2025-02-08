export type WorldClass = 'terrestial' | 'gaseous' | 'unknown';

export namespace WorldClass {
    export function fromString(str: string): WorldClass {
        switch (str) {
            case 'terrestial':
            case 'gaseous':
                return str;

            default:
                return 'unknown';
        }
    }
}

export type WorldParams = {
    radiusKm: number;
    massEarths: number;
    ageByrs: number;
    class: WorldClass;
    dayLength: number;
    axisTilt: number;
};

export type WorldSurfaceConditions = {
    tempK: number;
    pressureBar: number;
    g: number;
};

export type WorldOverview = {
    id: string;
    params: WorldParams;
    surface: WorldSurfaceConditions;

    isExplored: boolean;
    size: number;
};
