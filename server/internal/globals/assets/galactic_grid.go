package assets

import (
	"srv/internal/game"
	"srv/internal/utils/common"
	"srv/internal/utils/geom"
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

func LoadGalacticGrid() (game.GalacticGrid, common.Error) {
	var data galacticGridAsset
	err := globalLoader.loadJSONAsset("generated/galactic_grid.json", &data)
	if err != nil {
		return nil, newAssetParseError("generated/galactic_grid.json", err)
	}

	sectors := make(map[game.GalacticSectorID]*game.GalacticSector)
	for _, sector := range data.Sectors {
		sectors[game.GalacticSectorID(sector.ID)] = &game.GalacticSector{
			ID: game.GalacticSectorID(sector.ID),
			Coords: game.GalacticSectorCoords{
				InnerR:     game.GalacticCoordsRadius(sector.InnerR),
				OuterR:     game.GalacticCoordsRadius(sector.OuterR),
				ThetaStart: geom.Radians(sector.ThetaStart),
				ThetaEnd:   geom.Radians(sector.ThetaEnd),
			},
		}
	}

	grid := game.BuildGalacticGridFromSectorsData(sectors)
	return grid, nil
}

func SaveGalacticGrid(grid game.GalacticGrid) common.Error {
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

	err := globalLoader.saveJSONAsset("generated/galactic_grid.json", galacticGridAsset{
		Sectors: jsonSectors,
	})
	if err != nil {
		return newAssetSaveError("generated/galactic_grid.json", err)
	}
	return nil
}
