package encodables

import (
	"srv/internal/domain"
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
		conditions := e.planet.Tiles.GetConditions(world.PlanetaryNodeIndex(i))
		encodedTiles[i] = api.WorldPlanetTile{
			BiomeColor:       conditions.BiomeColor,
			SolidElevationKm: conditions.Solid.Elevation.Kilometers(),
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

type encodableGetSectorContentResult struct {
	stars []domain.Star
}

func NewGetSectorContentResultEncodable(stars []domain.Star) common.Encodable {
	return &encodableGetSectorContentResult{stars: stars}
}

func (data *encodableGetSectorContentResult) Encode() any {
	stars := make([]api.WorldGetSectorContentResultStar, len(data.stars))

	for i, star := range data.stars {
		stars[i] = api.WorldGetSectorContentResultStar{
			ID:             string(star.StarID),
			TempK:          star.StarData.Temperature.Kelvins(),
			LuminositySuns: star.StarData.Luminosity.Suns(),
			RadiusAu:       star.StarData.Radius.AstronomicalUnits(),
			MassSuns:       star.StarData.Mass.SolarMasses(),
			AgeByrs:        star.StarData.Age.BillionYears(),
		}
	}

	return &api.WorldGetSectorContentResult{
		Stars: stars,
	}
}

type encodableGalaxyGrid struct {
	sectors []*domain.GalacticSector
}

func NewGalaxyGridEncodable(sectors []*domain.GalacticSector) common.Encodable {
	return &encodableGalaxyGrid{sectors: sectors}
}

func (data *encodableGalaxyGrid) Encode() any {
	sectors := make([]api.WorldGetGalaxyGridResultSector, len(data.sectors))

	for i, sector := range data.sectors {
		sectors[i] = api.WorldGetGalaxyGridResultSector{
			ID:         string(sector.ID),
			InnerR:     float64(sector.Coords.InnerR),
			OuterR:     float64(sector.Coords.OuterR),
			ThetaStart: float64(sector.Coords.ThetaStart),
			ThetaEnd:   float64(sector.Coords.ThetaEnd),
		}
	}

	return &api.WorldGetGalaxyGridResult{
		InnerR:  float64(domain.InnerRimRadius),
		OuterR:  float64(domain.OuterRimRadius),
		MaxH:    float64(domain.MaxHeightDispacement),
		Sectors: sectors,
	}
}
