export type Asset<T> = {
    get: () => Promise<T>;
};

type CreateJSONAssetOptions<Raw, T> = {
    map?: (raw: Raw) => T;
    url: string;
};

export function createJSONAsset<Raw, T>({ url, map }: CreateJSONAssetOptions<Raw, T>): Asset<T> {
    let fetching: Promise<T> | null = null;

    const fetchAsset = async () => {
        const response = await fetch(url);
        if (!response.ok) {
            console.error(url, response);
            throw new Error('could not fetch the asset');
        }

        const json = (await response.json()) as Raw;
        return map ? map(json) : (json as unknown as T);
    };

    return {
        get: () => {
            if (!fetching) {
                fetching = fetchAsset();
            }
            return fetching;
        },
    };
}
