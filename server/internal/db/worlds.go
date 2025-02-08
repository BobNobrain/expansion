package db

import (
	"context"
	"encoding/json"
	"srv/internal/components"
	"srv/internal/db/dbq"
	"srv/internal/utils/color"
	"srv/internal/utils/common"
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
	"srv/internal/world"
)

type worldsRepoImpl struct {
	q *dbq.Queries
}

type worldDataJSON struct {
	Graph  [][]int   `json:"graph"`
	Coords []float64 `json:"coords"`

	Atmosphere map[string]float64 `json:"atm"`
	Oceans     map[string]float64 `json:"oceans"`
	Snow       map[string]float64 `json:"snow"`

	ElevationsScaleKm float64 `json:"elScaleKm"`

	TileColors       []float64 `json:"tileColors"`
	TileElevations   []float64 `json:"tileEls"`
	TileTempsK       []float64 `json:"tileTempsK"`
	TilePressuresBar []float64 `json:"tilePsBar"`
	TileSurface      []int     `json:"tileSurfaces"`
}

func (w *worldsRepoImpl) CreateWorlds(worlds []components.CreateWorldPayload) common.Error {
	createData := make([]dbq.CreateWorldsParams, 0, len(worlds))
	for _, world := range worlds {
		createData = append(createData, dbq.CreateWorldsParams{
			BodyID:            string(world.ID),
			SystemID:          string(world.ID.GetStarSystemID()),
			AgeByrs:           world.Params.Age.BillionYears(),
			RadiusKm:          world.Params.Radius.Kilometers(),
			MassEarths:        world.Params.Mass.EarthMasses(),
			Class:             encodeWorldClass(world.Params.Class),
			AxisTilt:          world.Params.AxisTilt.Radians(),
			DayLengthGameDays: world.Params.DayLength.Days(),
			GridSize:          int32(world.Size),
		})
	}

	_, err := w.q.CreateWorlds(context.Background(), createData)
	if err != nil {
		return makeDBError(err, "WorldsRepo::CreateWorlds")
	}
	return nil
}

func (w *worldsRepoImpl) ExploreWorld(payload components.ExploreWorldPayload) common.Error {
	uuid, err := parseUUID(string(payload.ExploredBy))
	if err != nil {
		return err
	}

	nTiles := payload.Data.Grid.Size()
	coords := make([]float64, 0, nTiles*3)
	tileColors := make([]float64, 0, nTiles*3)
	tileElevations := make([]float64, 0, nTiles)
	tileTemps := make([]float64, 0, nTiles)
	tilePressures := make([]float64, 0, nTiles)
	tileSurfaces := make([]int, 0, nTiles)

	for i := 0; i < payload.Data.Grid.Size(); i++ {
		pos := payload.Data.Grid.GetCoords(i)
		coords = append(coords, pos.X, pos.Y, pos.Z)

		tileData := payload.Data.Tiles[i]
		tileColors = append(tileColors, tileData.Color.R, tileData.Color.G, tileData.Color.B)
		tileElevations = append(tileElevations, tileData.Elevation)
		tileTemps = append(tileTemps, tileData.AvgTemp.Kelvins())
		tilePressures = append(tilePressures, tileData.Pressure.Bar())
		tileSurfaces = append(tileSurfaces, int(tileData.Surface))
	}

	surfaceData := worldDataJSON{
		Graph:  payload.Data.Grid.GetUnduplicatedConnections(),
		Coords: coords,

		Atmosphere: payload.Data.Atmosphere.ToMap(),
		Oceans:     payload.Data.Oceans.ToMap(),
		Snow:       payload.Data.Snow.ToMap(),

		ElevationsScaleKm: payload.Data.TileElevationsScale.Kilometers(),
		TileColors:        tileColors,
		TileElevations:    tileElevations,
		TileTempsK:        tileTemps,
		TilePressuresBar:  tilePressures,
		TileSurface:       tileSurfaces,
	}

	surfaceDataJSON, jerr := json.Marshal(surfaceData)
	if jerr != nil {
		return makeDBError(jerr, "WorldsRepo::ExploreWorld(SurfaceData.ToJSON)")
	}

	dberr := w.q.ExploreWorld(context.Background(), dbq.ExploreWorldParams{
		ExploredBy:         uuid,
		BodyID:             string(payload.ID),
		SurfacePressureBar: payload.Data.Conditions.Pressure.Bar(),
		SurfaceAvgTempK:    payload.Data.Conditions.AvgTemp.Kelvins(),
		SurfaceGravityG:    payload.Data.Conditions.Gravity.EarthGs(),
		GridSize:           int32(payload.Data.Grid.Size()),
		SurfaceData:        surfaceDataJSON,
	})
	if dberr != nil {
		return makeDBError(dberr, "WorldsRepo::ExploreWorld")
	}

	return nil
}

func (w *worldsRepoImpl) GetData(worldID world.CelestialID) (world.WorldData, common.Error) {
	dbWorld, dberr := w.q.GetWorld(context.Background(), string(worldID))
	if dberr != nil {
		return world.WorldData{}, makeDBError(dberr, "WorldsRepo::GetData")
	}

	dbWorldData, err := parseJSON[worldDataJSON](dbWorld.SurfaceData)
	if err != nil {
		return world.WorldData{}, err
	}

	nTiles := len(dbWorldData.Coords) / 3
	coords := make([]geom.Vec3, 0, nTiles)
	tiles := make([]world.WorldDataTile, 0, nTiles)
	for i := 0; i < nTiles; i++ {
		coords = append(coords, geom.Vec3{
			X: dbWorldData.Coords[i*3+0],
			Y: dbWorldData.Coords[i*3+1],
			Z: dbWorldData.Coords[i*3+2],
		})

		tiles = append(tiles, world.WorldDataTile{
			Color: color.RichColorRGB{
				R: dbWorldData.TileColors[i*3+0],
				G: dbWorldData.TileColors[i*3+1],
				B: dbWorldData.TileColors[i*3+2],
			},
			AvgTemp:   phys.Kelvins(dbWorldData.TileTempsK[i]),
			Surface:   world.BiomeSurface(dbWorldData.TileSurface[i]),
			Pressure:  phys.Bar(dbWorldData.TilePressuresBar[i]),
			Elevation: dbWorldData.TileElevations[i],
		})
	}

	result := world.WorldData{
		ID:    world.CelestialID(dbWorld.BodyID),
		Grid:  geom.RestoreSpatialGraph(coords, dbWorldData.Graph),
		Tiles: tiles,
		Conditions: world.SurfaceConditions{
			Pressure: phys.Bar(dbWorld.SurfacePressureBar),
			AvgTemp:  phys.Kelvins(dbWorld.SurfaceAvgTempK),
			Gravity:  phys.EarthGs(dbWorld.SurfaceGravityG),
		},
		Params: world.CelestialSurfaceParams{
			Radius: phys.Kilometers(dbWorld.RadiusKm),
			Mass:   phys.EarthMasses(dbWorld.MassEarths),
			Age:    phys.BillionYears(dbWorld.AgeByrs),
			Class:  decodeWorldClass(dbWorld.Class),
		},
	}

	return result, nil
}

func (w *worldsRepoImpl) GetOverviews(systemID world.StarSystemID) ([]world.WorldOverview, common.Error) {
	rows, dberr := w.q.GetWorldsInSystem(context.Background(), string(systemID))
	if dberr != nil {
		return nil, makeDBError(dberr, "WorldsRepo::GetOverviews")
	}

	result := make([]world.WorldOverview, 0, len(rows))
	for _, row := range rows {
		result = append(result, world.WorldOverview{
			ID:         world.CelestialID(row.BodyID),
			IsExplored: row.ExploredAt.Valid && row.ExploredBy.Valid,
			Size:       int(row.GridSize),
			Conditions: world.SurfaceConditions{
				Pressure: phys.Bar(row.SurfacePressureBar),
				AvgTemp:  phys.Kelvins(row.SurfaceAvgTempK),
				Gravity:  phys.EarthGs(row.SurfaceGravityG),
			},
			Params: world.CelestialSurfaceParams{
				Radius: phys.Kilometers(row.RadiusKm),
				Mass:   phys.EarthMasses(row.MassEarths),
				Age:    phys.BillionYears(row.AgeByrs),
				Class:  decodeWorldClass(row.Class),
			},
		})
	}

	return result, nil
}

func encodeWorldClass(class world.CelestialBodyClass) string {
	switch class {
	case world.CelestialBodyClassGaseous:
		return "G"
	case world.CelestialBodyClassTerrestial:
		return "T"
	default:
		return "?"
	}
}
func decodeWorldClass(class string) world.CelestialBodyClass {
	switch class {
	case "G":
		return world.CelestialBodyClassGaseous
	case "T":
		return world.CelestialBodyClassTerrestial
	default:
		return world.CelestialBodyClassTerrestial
	}
}
