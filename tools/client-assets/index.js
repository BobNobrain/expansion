const fs = require('node:fs');
const path = require('node:path');
const ASSETS_DIR = path.resolve(__dirname, '..', '..', 'assets');
const CLIENT_ASSETS_DIR = path.resolve(__dirname, '..', '..', 'ui', 'assets');

const COMMODITIES_SRC = path.join(ASSETS_DIR, 'crafting', 'commodities.json');
const COMMODITIES_DST = path.join(CLIENT_ASSETS_DIR, 'commodities.generated.json');
copyAsset(COMMODITIES_SRC, COMMODITIES_DST, ({ commodities, worldgenMaterials }) => {
    // to help typescript infer the type properly
    // TODO: jsonschema -> ts typings
    const cmd = commodities[Object.keys(commodities)[0]];
    cmd.quantized ??= false;

    return { mats: worldgenMaterials, commodities };
});

const BUILDINGS_SRC = path.join(ASSETS_DIR, 'crafting', 'buildings.json');
const BUILDINGS_DST = path.join(CLIENT_ASSETS_DIR, 'buildings.generated.json');
copyAsset(BUILDINGS_SRC, BUILDINGS_DST);

function copyAsset(src, dst, map = (x) => x) {
    const sourceAsset = fs.readFileSync(src, { encoding: 'utf-8' });
    const mappedAsset = map(JSON.parse(sourceAsset));
    delete mappedAsset['$schema'];
    fs.writeFileSync(dst, JSON.stringify(mappedAsset), { encoding: 'utf-8' });
    console.log(`written "${dst}"`);
}
