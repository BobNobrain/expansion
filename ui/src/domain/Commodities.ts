import commoditiesData from '../../assets/commodities.generated.json';

export type CommodityCategory = keyof typeof commoditiesData.cats;

const catsById = (Object.keys(commoditiesData.cats) as CommodityCategory[]).reduce<Record<string, CommodityCategory>>(
    (acc, cat) => {
        const ids = commoditiesData.cats[cat];
        for (const id of ids) {
            acc[id] = cat;
        }
        return acc;
    },
    {},
);

export function getCommodityCategory(id: string): CommodityCategory | undefined {
    return catsById[id];
}
