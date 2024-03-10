package gamerunner

import (
	"srv/internal/components"
	"srv/internal/utils/common"
	"srv/internal/world"
)

func LoadGalaxyContent(store components.Permastore) (*world.GalaxyContent, common.Error) {
	grid, err := store.GalacticSectorsRepo().GetAll()
	if err != nil {
		return nil, err
	}

	stars, err := store.CelestialRepo().LoadAll()
	if err != nil {
		return nil, err
	}

	return &world.GalaxyContent{
		Grid:        world.BuildGalacticGridFromSectorsList(grid),
		StarSystems: stars,
	}, nil
}
