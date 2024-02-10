package encodables

import (
	"srv/internal/utils/common"
	"srv/internal/world"
	"srv/pkg/api"
)

type encodablePlanetData struct {
	planet *world.Planet
}

func NewPlanetDataEncodable(planet *world.Planet) common.Encodable {
	return &encodablePlanetData{
		planet: planet,
	}
}

func (e *encodablePlanetData) Encode() interface{} {
	nNodes := e.planet.Grid.GetNodesCount()
	nEdges := e.planet.Grid.GetEdgesCount()

	encodedCoords := make([]float64, nNodes*3)
	for i := 0; i < nNodes; i++ {
		pos := e.planet.Grid.GetNodeCoords(world.PlanetaryNodeIndex(i))
		encodedCoords[i*3] = pos.X
		encodedCoords[i*3+1] = pos.Y
		encodedCoords[i*3+2] = pos.Z
	}

	encodedEdges := make([][]int, nNodes)
	for i := 0; i < nNodes; i++ {
		encodedEdges[i] = make([]int, 0)
	}

	for i := 0; i < nEdges; i++ {
		edge := e.planet.Grid.GetEdge(world.PlanetaryGridEdgeIndex(i))
		if edge.First() > edge.Second() {
			continue
		}

		first := int(edge.First())
		second := int(edge.Second())
		encodedEdges[first] = append(encodedEdges[first], second)
	}

	encodedTiles := make([]api.WorldPlanetTile, nNodes)
	for i := 0; i < nNodes; i++ {
		encodedTiles[i] = api.WorldPlanetTile{
			SolidElevationKm: e.planet.Tiles.GetConditions(world.PlanetaryNodeIndex(i)).Solid.Elevation.Kilometers(),
		}
	}

	return &api.WorldPlanetData{
		ID:   string(e.planet.ID),
		Name: e.planet.Name,

		RadiusKm:   e.planet.Radius.Kilometers(),
		SeaLevelKm: e.planet.SeaLevel.Kilometers(),

		Grid: api.WorldPlanetGrid{
			Coords: encodedCoords,
			Edges:  encodedEdges,
		},

		Tiles: encodedTiles,
	}
}
