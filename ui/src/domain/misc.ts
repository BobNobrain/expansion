export type ExplorationData = {
    at: Date;
    by: string;
};

export namespace ExplorationData {
    export function parse(data: { exploredAt?: string; exploredBy?: string }): ExplorationData | null {
        if (!data.exploredAt || !data.exploredBy) {
            return null;
        }
        const at = new Date(data.exploredAt);
        if (Number.isNaN(at.getTime()) || at.getTime() === 0) {
            return null;
        }

        return { at, by: data.exploredBy };
    }
}
