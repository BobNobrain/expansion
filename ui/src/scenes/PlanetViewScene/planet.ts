import * as T from 'three';
import { type MeshBuilder } from '../../lib/3d/MeshBuilder';
import { RandomNumberGenerator } from '../../lib/random';
import { icosahedron } from './gen/icosahedron';
import { rotateRandomEdges } from './gen/rotate';
import * as utils from './gen/utils';
import { relaxMesh } from './gen/relax';
import { getInvertedMesh } from './gen/invert';

export function createPlanetMeshes(): T.Mesh[] {
    const planetGraph = createPlanetGeometry();
    const planetSurface = getInvertedMesh(planetGraph);
    planetGraph.mapVerticies(utils.scale(1.01));

    const graphMesh = planetGraph.build();
    const graphMaterial = new T.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.2,
        wireframe: true,
    });
    const graph = new T.Mesh(graphMesh, graphMaterial);

    const surfaceMaterial = new T.MeshStandardMaterial({
        color: 0x2080f0,
        emissive: 0x2080f0,
        emissiveIntensity: 0.05,
        roughness: 0.6,
        metalness: 0.3,
        flatShading: true,
        // wireframe: true,
    });
    const surfaceMesh = planetSurface.build();
    const surface = new T.Mesh(surfaceMesh, surfaceMaterial);
    surface.castShadow = true;

    return [graph, surface];
}

function createPlanetGeometry(): MeshBuilder {
    const SIZE = 1;
    const planet = icosahedron({
        size: SIZE,
        subdivisions: 3,
    });

    // @ts-expect-error 111
    window.builder = planet;

    const rng = new RandomNumberGenerator('deadmouse');
    const seq = rng.detached();
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
