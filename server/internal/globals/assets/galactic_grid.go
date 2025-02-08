package assets

import (
	"srv/internal/utils/common"
	"srv/internal/utils/geom"
	"srv/internal/world"
)

type galacticGridAsset struct {
	Sectors []galacticGridAssetSector `json:"sectors"`
}

type galacticGridAssetSector struct {
	ID         string  `json:"id"`
	ThetaStart float64 `json:"th_s"`
	ThetaEnd   float64 `json:"th_e"`
	InnerR     float64 `json:"r_max"`
	OuterR     float64 `json:"r_min"`
}

func LoadGalacticGrid() (world.GalacticGrid, common.Error) {
	var data galacticGridAsset
	err := globalLoader.loadJSONAsset("galactic_grid.json", &data)
	if err != nil {
		return nil, newAssetParseError("galactic_grid.json", err)
	}

	sectors := make(map[world.GalacticSectorID]*world.GalacticSector)
	for _, sector := range data.Sectors {
		sectors[world.GalacticSectorID(sector.ID)] = &world.GalacticSector{
			ID: world.GalacticSectorID(sector.ID),
			Coords: world.GalacticSectorCoords{
				InnerR:     world.GalacticCoordsRadius(sector.InnerR),
				OuterR:     world.GalacticCoordsRadius(sector.OuterR),
				ThetaStart: geom.Radians(sector.ThetaStart),
				ThetaEnd:   geom.Radians(sector.ThetaEnd),
			},
		}
	}

	grid := world.BuildGalacticGridFromSectorsData(sectors)
	return grid, nil
}

func SaveGalacticGrid(grid world.GalacticGrid) common.Error {
	jsonSectors := make([]galacticGridAssetSector, 0, grid.Size())
	for _, sector := range grid.GetSectors() {
		jsonSectors = append(jsonSectors, galacticGridAssetSector{
			ID:         string(sector.ID),
			ThetaStart: sector.Coords.ThetaStart.Radians(),
			ThetaEnd:   sector.Coords.ThetaEnd.Radians(),
			InnerR:     float64(sector.Coords.InnerR),
			OuterR:     float64(sector.Coords.OuterR),
		})
	}

	err := globalLoader.saveJSONAsset("galactic_grid.json", galacticGridAsset{
		Sectors: jsonSectors,
	})
	if err != nil {
		return newAssetSaveError("galactic_grid.json", err)
	}
	return nil
}
