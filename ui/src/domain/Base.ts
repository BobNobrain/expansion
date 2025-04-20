export type BaseOverview = {
    id: number;
    worldId: string;
    tileId: string;

    created: Date;

    nEquipment: number;
    /** 0..1 */
    areaUsage: number;
    /** 0..1 */
    inventoryUsage: number;
    /** 0..1 */
    employment: number;
};
