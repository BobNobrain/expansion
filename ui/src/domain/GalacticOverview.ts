import { type GalacticCoords } from './GalacticCoords';
import { type StarWithCoords } from './Star';

export type GalacticGridSector = {
    id: string;
    innerR: number;
    outerR: number;
    thetaStart: number;
    thetaEnd: number;
};

export namespace GalacticGridSector {
    export function contains(sector: GalacticGridSector, point: GalacticCoords): boolean {
        const hasR = sector.innerR <= point.r && point.r < sector.outerR;
        if (!hasR) {
            return false;
        }

        const hasTheta = sector.thetaStart <= point.theta && point.theta < sector.thetaEnd;
        if (hasTheta) {
            return true;
        }

        const theta1 = point.theta + 2 * Math.PI;
        return sector.thetaStart <= theta1 && theta1 < sector.thetaEnd;
    }
}

export type GalacticGridData = {
    innerR: number;
    outerR: number;
    maxH: number;
    sectors: GalacticGridSector[];
};

export class GalacticGrid {
    readonly innerR: number;
    readonly outerR: number;
    readonly maxH: number;
    readonly sectors: ReadonlyArray<GalacticGridSector>;

    private byId: Record<string, GalacticGridSector> = {};

    constructor({ innerR, outerR, maxH, sectors }: GalacticGridData) {
        this.innerR = innerR;
        this.outerR = outerR;
        this.maxH = maxH;
        this.sectors = sectors;

        for (const s of sectors) {
            this.byId[s.id] = s;
        }
    }

    findContainingSector(point: GalacticCoords): GalacticGridSector | null {
        // TODO: add some cache
        for (const s of this.sectors) {
            if (GalacticGridSector.contains(s, point)) {
                return s;
            }
        }
        return null;
    }

    getSectorById(id: string): GalacticGridSector | null {
        return this.byId[id] ?? null;
    }
}

export type GalacticLandmark = Pick<StarWithCoords, 'id' | 'coords' | 'luminositySuns' | 'tempK'>;

export type GalacticLabelType = 'base' | 'ship' | 'market' | 'other';
export namespace GalacticLabelType {
    export function parse(raw: string): GalacticLabelType {
        switch (raw) {
            case 'base':
            case 'ship':
            case 'market':
                return raw;

            default:
                return 'other';
        }
    }
}

export type GalacticLabel = {
    coords: GalacticCoords;
    label: string;
    type: GalacticLabelType;
};

export type GalacticOverview = {
    grid: GalacticGrid;
    landmarks: GalacticLandmark[];
    labels: GalacticLabel[];
};
