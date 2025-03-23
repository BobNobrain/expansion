package datafront

import (
	"srv/internal/datafront/dfcore"
	"srv/internal/game"
	"srv/internal/globals/assets"
	"srv/internal/utils/common"
	"srv/pkg/api"
)

type galaxyMapSingleton struct {
	value dfcore.QueryableSingleton

	grid      game.GalacticGrid
	valueData *api.DFGalaxyValue
}

func (gdf *GameDataFront) InitGalaxyMap() {
	gmap := &galaxyMapSingleton{}

	gmap.value = dfcore.NewQueryableSingleton(gmap.getValue)
	gmap.init()

	gdf.df.AttachSingleton("galaxy", gmap.value)
	gdf.galaxy = gmap
}

func (gmap *galaxyMapSingleton) getValue(_ dfcore.DFRequestContext) (common.Encodable, common.Error) {
	return common.AsEncodable(gmap.valueData), nil
}

func (gmap *galaxyMapSingleton) init() {
	valueData := &api.DFGalaxyValue{
		OuterR: float64(game.OuterRimRadius),
		InnerR: float64(game.InnerRimRadius),
		MaxH:   float64(game.MaxHeightDispacement),
	}

	if gmap.grid == nil {
		grid, err := assets.LoadGalacticGrid()
		if err != nil {
			panic(err)
		}

		gmap.grid = grid
	}

	for _, sector := range gmap.grid.GetSectors() {
		valueData.Sectors = append(valueData.Sectors, api.DFGalaxyValueSector{
			ID:         string(sector.ID),
			InnerR:     float64(sector.Coords.InnerR),
			OuterR:     float64(sector.Coords.OuterR),
			ThetaStart: sector.Coords.ThetaStart.Radians(),
			ThetaEnd:   sector.Coords.ThetaEnd.Radians(),
		})
	}

	// TODO: beacons
	// TODO: waypoints

	gmap.valueData = valueData
}
