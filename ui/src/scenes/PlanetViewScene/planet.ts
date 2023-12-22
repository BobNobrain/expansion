import * as T from 'three';
import { type MeshBuilder } from '../../lib/3d/MeshBuilder';
import { RandomNumberGenerator, type RandomSequence } from '../../lib/random';
import { icosahedron } from './gen/icosahedron';
import { rotateRandomEdges } from './gen/rotate';
import * as utils from './gen/utils';
import { relaxMesh } from './gen/relax';
import { getInvertedMesh } from './gen/invert';
import { generateHabitablePlanet } from './gen/habitable';

export function createPlanetMeshes(): T.Mesh[] {
    const rng = new RandomNumberGenerator('deadmouse');
    const seq = rng.detached();

    const planetGraph = createPlanetGeometry(seq);
    const planetSurface = getInvertedMesh(planetGraph);

    const tiles = generateHabitablePlanet({
        graph: planetGraph,
        seq,
    });
    tiles.paintSurface(planetSurface);

    planetGraph.mapVerticies((v, i) => {
        const e = tiles.getTile(i).data.elevation;
        return utils.mul(v, 1 + 0.05 + e * 0.05);
    });

    const graphMesh = planetGraph.build();
    tiles.paintGraph(graphMesh);
    const graphMaterial = new T.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.02,
        opacity: 0.5,
        vertexColors: true,
        wireframe: true,
    });
    const graph = new T.Mesh(graphMesh, graphMaterial);

    const surfaceMaterial = new T.MeshStandardMaterial({
        roughness: 0.6,
        metalness: 0.3,
        flatShading: true,
        vertexColors: true,
    });
    const surfaceMesh = planetSurface.build();
    const surface = new T.Mesh(surfaceMesh, surfaceMaterial);
    surface.castShadow = true;

    return [graph, surface];
}

function createPlanetGeometry(seq: RandomSequence): MeshBuilder {
    const SIZE = 1;
    const planet = icosahedron({
        size: SIZE,
        subdivisions: 3,
    });

    // @ts-expect-error 111
    window.builder = planet;

    rotateRandomEdges({
        builder: planet,
        seq,
        minRotations: 50,
        maxRotations: 100,
    });

    const idealFaceArea = (4 * Math.PI * SIZE * SIZE) / planet.size().faces;
    const idealEdgeLength = Math.sqrt((idealFaceArea * 4) / Math.sqrt(3));

    relaxMesh(planet, {
        targetEdgeLength: idealEdgeLength,
        maxPasses: 100,
        changeRate: 0.9,
        minChange: idealEdgeLength * 0.01,
        mode: 'edge',
        seq,
    });

    return planet;
}
