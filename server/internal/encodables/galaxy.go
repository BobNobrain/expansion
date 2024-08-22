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
		Systems: make([]api.WorldGetSectorContentResultStarSystem, 0, len(content.Items)),
		Total:   content.Page.Total,
		Offset:  content.Page.Offset,
	}

	for _, system := range content.Items {
		encodedSystem := api.WorldGetSectorContentResultStarSystem{
			ID:          string(system.GetSystemID()),
			CoordsR:     float64(system.GetCoords().R),
			CoordsTheta: float64(system.GetCoords().Theta),
			CoordsH:     float64(system.GetCoords().H),
			Stars:       make([]api.WorldGetSectorContentResultStar, 0, len(system.GetStars())),
			IsExplored:  system.IsExplored(),
			ExploredBy:  string(system.GetExploredBy()),
			ExploredAt:  system.GetExploredAt().UnixMilli(),
			NPlanets:    system.GetNPlanets(),
			NAsteroids:  system.GenNAsteroids(),
		}

		for _, star := range system.GetStars() {
			encodedSystem.Stars = append(encodedSystem.Stars, encodeStar(star))
		}

		encoded.Systems = append(encoded.Systems, encodedSystem)
	}

	return common.AsEncodable(encoded)
}

func NewGalaxyOverviewEncodable(
	sectors []*world.GalacticSector,
	landmarks []world.GalaxyBeacon,
) common.Encodable {
	sectorsData := make([]api.WorldGetGalaxyOverviewResultGridSector, len(sectors))

	for i, sector := range sectors {
		sectorsData[i] = api.WorldGetGalaxyOverviewResultGridSector{
			ID:         string(sector.ID),
			InnerR:     float64(sector.Coords.InnerR),
			OuterR:     float64(sector.Coords.OuterR),
			ThetaStart: float64(sector.Coords.ThetaStart),
			ThetaEnd:   float64(sector.Coords.ThetaEnd),
		}
	}

	landmarksData := make([]api.WorldGetGalaxyOverviewResultLandmark, len(landmarks))
	for i, star := range landmarks {
		landmarksData[i] = api.WorldGetGalaxyOverviewResultLandmark{
			CoordsR:        float64(star.Coords.R),
			CoordsTheta:    float64(star.Coords.Theta),
			CoordsH:        float64(star.Coords.H),
			StarID:         string(star.StarID),
			TempK:          star.Params.Temperature.Kelvins(),
			LuminositySuns: star.Params.Luminosity.Suns(),
		}
	}

	labelsData := make([]api.WorldGetGalaxyOverviewResultLabel, 0)

	return common.AsEncodable(api.WorldGetGalaxyOverviewResult{
		Grid: api.WorldGetGalaxyOverviewResultGrid{
			InnerR:  float64(world.InnerRimRadius),
			OuterR:  float64(world.OuterRimRadius),
			MaxH:    float64(world.MaxHeightDispacement),
			Sectors: sectorsData,
		},
		Landmarks: landmarksData,
		Labels:    labelsData,
	})
}

func NewGetSystemContentResultEncodable(sys world.StarSystem) common.Encodable {
	if !sys.IsExplored() {
		// This should not normally happen, as client should not ask for
		// content of systems that are not explored yet.
		return common.AsEncodable(api.WorldGetSystemContentResult{})
	}

	stars := sys.GetStars()
	orbits := sys.GetOrbits()
	surfaces := sys.GetSurfaces()

	result := &api.WorldGetSystemContentResult{
		Stars:    make([]api.WorldGetSectorContentResultStar, 0, len(stars)),
		Orbits:   make([]api.WorldGetSystemContentResultOrbit, 0, len(orbits)),
		Surfaces: make([]api.WorldGetSystemContentResultSurface, 0, len(surfaces)),
	}

	for _, star := range stars {
		result.Stars = append(result.Stars, encodeStar(star))
	}

	for id, orbit := range orbits {
		result.Orbits = append(result.Orbits, api.WorldGetSystemContentResultOrbit{
			BodyID:               string(id),
			OrbitsAround:         string(orbit.Center),
			OrbitSemiMajorAxisAu: orbit.Ellipse.SemiMajor.AstronomicalUnits(),
			OrbitEccentricity:    orbit.Ellipse.Eccentricity,
			OrbitRotation:        orbit.Rotation.Radians(),
			OrbitInclination:     orbit.Inclination.Radians(),
			TimeAtPeriapsis:      orbit.T0.Unix(),
		})
	}

	for _, surface := range surfaces {
		result.Surfaces = append(result.Surfaces, api.WorldGetSystemContentResultSurface{
			SurfaceID:  string(surface.GetID()),
			IsExplored: false,
		})
	}

	return common.AsEncodable(result)
}

func encodeStar(star *world.Star) api.WorldGetSectorContentResultStar {
	return api.WorldGetSectorContentResultStar{
		ID:             string(star.ID),
		TempK:          star.Params.Temperature.Kelvins(),
		LuminositySuns: star.Params.Luminosity.Suns(),
		RadiusAu:       star.Params.Radius.AstronomicalUnits(),
		MassSuns:       star.Params.Mass.SolarMasses(),
		AgeByrs:        star.Params.Age.BillionYears(),
	}
}
