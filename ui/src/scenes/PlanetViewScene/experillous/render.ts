import * as THREE from 'three';
import { type XorShift128 } from './random';
import { type Topology, type Tile } from './topology';

type RenderData = {};

export function generatePlanetRenderData(topology: Topology, random: XorShift128) {
    const renderData: RenderData = {};

    buildSurfaceRenderObject(topology.tiles, random);

    return renderData;
}

function buildSurfaceRenderObject(tiles: Tile[], _random: XorShift128) {
    const planetGeometry = new THREE.BufferGeometry();
    // const terrainColors = [];
    // const plateColors = [];
    // const elevationColors = [];
    // const temperatureColors = [];
    // const moistureColors = [];

    for (let i = 0; i < tiles.length; i++) {
        const tile = tiles[i];

        // const colorDeviance = new THREE.Color(random.unit(), random.unit(), random.unit());
        // let terrainColor;
        // if (tile.elevation <= 0) {
        //     var normalizedElevation = Math.min(-tile.elevation, 1);
        //     if (tile.biome === 'ocean')
        //         terrainColor = new THREE.Color(0x0066ff)
        //             .lerp(new THREE.Color(0x0044bb), Math.min(-tile.elevation, 1))
        //             .lerp(colorDeviance, 0.1);
        //     else if (tile.biome === 'oceanGlacier') terrainColor = new THREE.Color(0xddeeff).lerp(colorDeviance, 0.1);
        //     else terrainColor = new THREE.Color(0xff00ff);
        // } else if (tile.elevation < 0.6) {
        //     var normalizedElevation = tile.elevation / 0.6;
        //     if (tile.biome === 'desert')
        //         terrainColor = new THREE.Color(0xdddd77)
        //             .lerp(new THREE.Color(0xbbbb55), normalizedElevation)
        //             .lerp(colorDeviance, 0.1);
        //     else if (tile.biome === 'rainForest')
        //         terrainColor = new THREE.Color(0x44dd00)
        //             .lerp(new THREE.Color(0x229900), normalizedElevation)
        //             .lerp(colorDeviance, 0.2);
        //     else if (tile.biome === 'rocky')
        //         terrainColor = new THREE.Color(0xaa9977)
        //             .lerp(new THREE.Color(0x887755), normalizedElevation)
        //             .lerp(colorDeviance, 0.15);
        //     else if (tile.biome === 'plains')
        //         terrainColor = new THREE.Color(0x99bb44)
        //             .lerp(new THREE.Color(0x667722), normalizedElevation)
        //             .lerp(colorDeviance, 0.1);
        //     else if (tile.biome === 'grassland')
        //         terrainColor = new THREE.Color(0x77cc44)
        //             .lerp(new THREE.Color(0x448822), normalizedElevation)
        //             .lerp(colorDeviance, 0.15);
        //     else if (tile.biome === 'swamp')
        //         terrainColor = new THREE.Color(0x77aa44)
        //             .lerp(new THREE.Color(0x446622), normalizedElevation)
        //             .lerp(colorDeviance, 0.25);
        //     else if (tile.biome === 'deciduousForest')
        //         terrainColor = new THREE.Color(0x33aa22)
        //             .lerp(new THREE.Color(0x116600), normalizedElevation)
        //             .lerp(colorDeviance, 0.1);
        //     else if (tile.biome === 'tundra')
        //         terrainColor = new THREE.Color(0x9999aa)
        //             .lerp(new THREE.Color(0x777788), normalizedElevation)
        //             .lerp(colorDeviance, 0.15);
        //     else if (tile.biome === 'landGlacier') terrainColor = new THREE.Color(0xddeeff).lerp(colorDeviance, 0.1);
        //     else terrainColor = new THREE.Color(0xff00ff);
        // } else if (tile.elevation < 0.8) {
        //     var normalizedElevation = (tile.elevation - 0.6) / 0.2;
        //     if (tile.biome === 'tundra')
        //         terrainColor = new THREE.Color(0x777788)
        //             .lerp(new THREE.Color(0x666677), normalizedElevation)
        //             .lerp(colorDeviance, 0.1);
        //     else if (tile.biome === 'coniferForest')
        //         terrainColor = new THREE.Color(0x338822)
        //             .lerp(new THREE.Color(0x116600), normalizedElevation)
        //             .lerp(colorDeviance, 0.1);
        //     else if (tile.biome === 'snow')
        //         terrainColor = new THREE.Color(0xeeeeee)
        //             .lerp(new THREE.Color(0xdddddd), normalizedElevation)
        //             .lerp(colorDeviance, 0.1);
        //     else if (tile.biome === 'mountain')
        //         terrainColor = new THREE.Color(0x555544)
        //             .lerp(new THREE.Color(0x444433), normalizedElevation)
        //             .lerp(colorDeviance, 0.05);
        //     else terrainColor = new THREE.Color(0xff00ff);
        // } else {
        //     var normalizedElevation = Math.min((tile.elevation - 0.8) / 0.5, 1);
        //     if (tile.biome === 'mountain')
        //         terrainColor = new THREE.Color(0x444433)
        //             .lerp(new THREE.Color(0x333322), normalizedElevation)
        //             .lerp(colorDeviance, 0.05);
        //     else if (tile.biome === 'snowyMountain')
        //         terrainColor = new THREE.Color(0xdddddd)
        //             .lerp(new THREE.Color(0xffffff), normalizedElevation)
        //             .lerp(colorDeviance, 0.1);
        //     else terrainColor = new THREE.Color(0xff00ff);
        // }

        // var plateColor = tile.plate.color.clone();

        // var elevationColor;
        // if (tile.elevation <= 0)
        //     elevationColor = new THREE.Color(0x224488).lerp(
        //         new THREE.Color(0xaaddff),
        //         Math.max(0, Math.min((tile.elevation + 3 / 4) / (3 / 4), 1)),
        //     );
        // else if (tile.elevation < 0.75)
        //     elevationColor = new THREE.Color(0x997755).lerp(
        //         new THREE.Color(0x553311),
        //         Math.max(0, Math.min(tile.elevation / (3 / 4), 1)),
        //     );
        // else
        //     elevationColor = new THREE.Color(0x553311).lerp(
        //         new THREE.Color(0x222222),
        //         Math.max(0, Math.min((tile.elevation - 3 / 4) / (1 / 2), 1)),
        //     );

        // var temperatureColor;
        // if (tile.temperature <= 0)
        //     temperatureColor = new THREE.Color(0x0000ff).lerp(
        //         new THREE.Color(0xbbddff),
        //         Math.max(0, Math.min((tile.temperature + 2 / 3) / (2 / 3), 1)),
        //     );
        // else
        //     temperatureColor = new THREE.Color(0xffff00).lerp(
        //         new THREE.Color(0xff0000),
        //         Math.max(0, Math.min(tile.temperature / (3 / 3), 1)),
        //     );

        // var moistureColor = new THREE.Color(0xffcc00).lerp(
        //     new THREE.Color(0x0066ff),
        //     Math.max(0, Math.min(tile.moisture, 1)),
        // );

        let baseIndex = planetGeometry.vertices.length;
        planetGeometry.vertices.push(tile.averagePosition);
        for (var j = 0; j < tile.corners.length; ++j) {
            var cornerPosition = tile.corners[j].position;
            planetGeometry.vertices.push(cornerPosition);
            planetGeometry.vertices.push(
                tile.averagePosition.clone().sub(cornerPosition).multiplyScalar(0.1).add(cornerPosition),
            );

            var i0 = j * 2;
            var i1 = ((j + 1) % tile.corners.length) * 2;
            buildTileWedge(planetGeometry.faces, baseIndex, i0, i1, tile.normal);
            buildTileWedgeColors(terrainColors, terrainColor, terrainColor.clone().multiplyScalar(0.5));
            buildTileWedgeColors(plateColors, plateColor, plateColor.clone().multiplyScalar(0.5));
            buildTileWedgeColors(elevationColors, elevationColor, elevationColor.clone().multiplyScalar(0.5));
            buildTileWedgeColors(temperatureColors, temperatureColor, temperatureColor.clone().multiplyScalar(0.5));
            buildTileWedgeColors(moistureColors, moistureColor, moistureColor.clone().multiplyScalar(0.5));
            for (var k = planetGeometry.faces.length - 3; k < planetGeometry.faces.length; ++k)
                planetGeometry.faces[k].vertexColors = terrainColors[k];
        }
    }

    planetGeometry.dynamic = true;
    // planetGeometry.setAttribute('dynamic', new THREE.BufferAttribute());
    planetGeometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1000);
    const planetMaterial = new THREE.MeshLambertMaterial({
        color: new THREE.Color(0x000000),
        // ambient: new THREE.Color(0xffffff),
        // vertexColors: THREE.VertexColors,
    });
    const planetRenderObject = new THREE.Mesh(planetGeometry, planetMaterial);

    return {
        geometry: planetGeometry,
        terrainColors: terrainColors,
        plateColors: plateColors,
        elevationColors: elevationColors,
        temperatureColors: temperatureColors,
        moistureColors: moistureColors,
        material: planetMaterial,
        renderObject: planetRenderObject,
    };
}
