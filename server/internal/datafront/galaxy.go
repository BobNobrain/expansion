package datafront

import (
	"srv/internal/components"
	"srv/internal/datafront/dfcore"
	"srv/internal/utils/binpack"
	"srv/internal/utils/common"
	"srv/internal/world"
	"srv/pkg/api"
)

type galaxyMapSingleton struct {
	value    dfcore.QueryableSingleton
	precalcs components.BlobsRepo

	grid      world.GalacticGrid
	valueData *api.DFGalaxyValue
}

func (gdf *GameDataFront) InitGalaxyMap(precalcs components.BlobsRepo) {
	gmap := &galaxyMapSingleton{
		precalcs: precalcs,
	}

	gmap.value = dfcore.NewQueryableSingleton(gmap.getValue)

	gdf.df.AttachSingleton("galaxy", gmap.value)
	gdf.galaxy = gmap
}

func (gmap *galaxyMapSingleton) getValue() (common.Encodable, common.Error) {
	return common.AsEncodable(gmap.valueData), nil
}

func (gmap *galaxyMapSingleton) init() common.Error {
	valueData := &api.DFGalaxyValue{
		OuterR: float64(world.OuterRimRadius),
		InnerR: float64(world.InnerRimRadius),
		MaxH:   float64(world.MaxHeightDispacement),
	}

	if gmap.grid == nil {
		gridBlob, err := gmap.precalcs.Get("global/galactic_grid")
		if err != nil {
			return err
		}

		sectors := make([]*world.GalacticSector, 0)
		r := binpack.NewReaderFromBytes(gridBlob.Data)
		len := int(r.ReadUVarInt())
		for i := 0; i < len; i++ {
			sector := binpack.Read[world.GalacticSector](r)
			sectors = append(sectors, &sector)
		}

		if r.GetError() != nil {
			return common.NewWrapperErrorWithDetails(
				"ERR_DECODE",
				r.GetError(),
				common.NewDictEncodable().Set("operation", "df.galaxy.init"),
			)
		}

		gmap.grid = world.BuildGalacticGridFromSectorsList(sectors)
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
	return nil
}
