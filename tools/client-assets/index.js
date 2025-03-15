const fs = require('node:fs');
const path = require('node:path');
const ASSETS_DIR = path.resolve(__dirname, '..', '..', 'assets');
const CLIENT_ASSETS_DIR = path.resolve(__dirname, '..', '..', 'ui', 'assets');

const COMMODITIES_SRC = path.join(ASSETS_DIR, 'crafting', 'commodities.json');
const COMMODITIES_DST = path.join(CLIENT_ASSETS_DIR, 'commodities.generated.json');
copyAsset(COMMODITIES_SRC, COMMODITIES_DST, ({ commodities, worldgenMaterials }) => {
    const commoditiesByCategory = {};

    for (const id of Object.keys(commodities)) {
        const cat = commodities[id].category;
        if (!commoditiesByCategory[cat]) {
            commoditiesByCategory[cat] = [];
        }
        commoditiesByCategory[cat].push(id);
    }

    return { mats: worldgenMaterials, cats: commoditiesByCategory };
});

function copyAsset(src, dst, map) {
    const sourceAsset = fs.readFileSync(src, { encoding: 'utf-8' });
    const mappedAsset = map(JSON.parse(sourceAsset));
    fs.writeFileSync(dst, JSON.stringify(mappedAsset), { encoding: 'utf-8' });
    console.log(`written "${dst}"`);
}
