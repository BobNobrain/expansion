package encodables

import (
	"srv/internal/utils/common"
	"srv/internal/utils/pagination"
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

func NewGetSectorContentResultEncodable(content pagination.Page[world.StarSystem]) common.Encodable {
	encoded := &api.WorldGetSectorContentResult{
		Systems: make([]api.WorldGetSectorContentResultStarSystem, len(content.Items)),
		Total:   content.Page.Total,
		Offset:  content.Page.Offset,
	}

	for i, system := range content.Items {
		encoded.Systems[i] = api.WorldGetSectorContentResultStarSystem{
			ID:          string(system.GetSystemID()),
			CoordsR:     float64(system.GetCoords().R),
			CoordsTheta: float64(system.GetCoords().Theta),
			CoordsH:     float64(system.GetCoords().H),
			Stars:       make([]api.WorldGetSectorContentResultStar, len(system.GetStars())),
			NPlanets:    system.GetNPlanets(),
			NAsteroids:  system.GenNAsteroids(),
		}

		for j, star := range system.GetStars() {
			encoded.Systems[i].Stars[j] = api.WorldGetSectorContentResultStar{
				ID:             string(star.ID),
				TempK:          star.Params.Temperature.Kelvins(),
				LuminositySuns: star.Params.Luminosity.Suns(),
				RadiusAu:       star.Params.Radius.AstronomicalUnits(),
				MassSuns:       star.Params.Mass.SolarMasses(),
				AgeByrs:        star.Params.Age.BillionYears(),
			}
		}
	}

	return common.AsEncodable(encoded)
}

type encodableGalaxyOverview struct {
	sectors   []*world.GalacticSector
	landmarks []world.GalaxyBeacon
}

func NewGalaxyOverviewEncodable(
	sectors []*world.GalacticSector,
	landmarks []world.GalaxyBeacon,
) common.Encodable {
	return &encodableGalaxyOverview{sectors: sectors, landmarks: landmarks}
}

func (data *encodableGalaxyOverview) Encode() any {
	sectors := make([]api.WorldGetGalaxyOverviewResultGridSector, len(data.sectors))

	for i, sector := range data.sectors {
		sectors[i] = api.WorldGetGalaxyOverviewResultGridSector{
			ID:         string(sector.ID),
			InnerR:     float64(sector.Coords.InnerR),
			OuterR:     float64(sector.Coords.OuterR),
			ThetaStart: float64(sector.Coords.ThetaStart),
			ThetaEnd:   float64(sector.Coords.ThetaEnd),
		}
	}

	landmarks := make([]api.WorldGetGalaxyOverviewResultLandmark, len(data.landmarks))
	for i, star := range data.landmarks {
		landmarks[i] = api.WorldGetGalaxyOverviewResultLandmark{
			CoordsR:        float64(star.Coords.R),
			CoordsTheta:    float64(star.Coords.Theta),
			CoordsH:        float64(star.Coords.H),
			StarID:         string(star.StarID),
			TempK:          star.Params.Temperature.Kelvins(),
			LuminositySuns: star.Params.Luminosity.Suns(),
		}
	}

	labels := make([]api.WorldGetGalaxyOverviewResultLabel, 0)

	return &api.WorldGetGalaxyOverviewResult{
		Grid: api.WorldGetGalaxyOverviewResultGrid{
			InnerR:  float64(world.InnerRimRadius),
			OuterR:  float64(world.OuterRimRadius),
			MaxH:    float64(world.MaxHeightDispacement),
			Sectors: sectors,
		},
		Landmarks: landmarks,
		Labels:    labels,
	}
}
