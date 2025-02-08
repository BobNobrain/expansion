/** @deprecated TODO: remove */

type UsePlanetDataResult = {
    getData: () => never;
};

export const usePlanetData = (): UsePlanetDataResult => {
    return {
        getData: () => {
            throw new Error('deprecated');
        },
    };
};
