package encodables

import (
	"srv/internal/utils/common"
	"srv/internal/utils/pagination"
	"srv/internal/world"
	"srv/pkg/api"
)

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

func NewGetSystemContentResultEncodable(sys world.StarSystem, surfaces []world.SurfaceOverview) common.Encodable {
	if !sys.IsExplored() {
		// This should not normally happen, as client should not ask for
		// content of systems that are not explored yet.
		return common.AsEncodable(api.WorldGetSystemContentResult{})
	}

	stars := sys.GetStars()
	orbits := sys.GetOrbits()

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
			SurfaceID:    string(surface.GetID()),
			IsExplored:   surface.IsExplored(),
			RadiusKm:     surface.GetParams().Radius.Kilometers(),
			AgeByrs:      surface.GetParams().Age.BillionYears(),
			Size:         surface.GetSize(),
			Class:        surface.GetParams().Class.String(),
			AxisTiltRads: surface.GetParams().AxisTilt.Radians(),
			AvgTempK:     surface.GetConditions().AvgTemp.Kelvins(),
			PressureBar:  surface.GetConditions().Pressure.Bar(),
			GravityGs:    surface.GetConditions().Gravity.EarthGs(),
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

func NewGetSurfaceResultEncodable(surface world.SurfaceData) common.Encodable {
	grid := surface.GetGrid()
	rawGrid := grid.ToRawData()
	size := len(rawGrid.Coords)

	conditions := surface.GetConditions()
	composition := surface.GetComposition()

	result := &api.WorldGetSurfaceResult{
		SurfaceID: string(surface.GetID()),
		Grid: api.WorldGetSurfaceResultGrid{
			Coords: make([]float64, size*3),
			Edges:  rawGrid.Connections,
		},
		Colors:              make([][]float64, 0, size),
		Elevations:          make([]float64, 0, size),
		AverageTempK:        conditions.AvgTemp.Kelvins(),
		SeaLevelPressureBar: conditions.Pressure.Bar(),
		AtmosphereContent:   composition.Atmosphere.ToMap(),
		OceansContent:       composition.Oceans.ToMap(),
		OceansLevel:         composition.OceanLevel,
	}

	for i := 0; i < size; i++ {
		coords := grid.GetNodeCoords(world.PlanetaryTileIndex(i))
		result.Grid.Coords[i*3+0] = coords.X
		result.Grid.Coords[i*3+1] = coords.Y
		result.Grid.Coords[i*3+2] = coords.Z
	}

	tileConditions := surface.GetTileConditions()
	for _, tile := range tileConditions {
		reflective := tile.BiomeColor.Reflective
		result.Colors = append(result.Colors, []float64{reflective.R, reflective.G, reflective.B})
		result.Elevations = append(result.Elevations, tile.Elevation.Kilometers())
	}

	return common.AsEncodable(result)
}
