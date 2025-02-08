package galaxymap

import (
	"srv/internal/components"
	"srv/internal/game"
	"srv/internal/globals/assets"
	"srv/internal/globals/logger"
	"srv/internal/utils/common"
	"srv/internal/world"
	"srv/internal/world/worldgen"
)

type galaxyMap struct {
	grid world.GalacticGrid

	generator   *worldgen.WorldGen
	starSystems components.StarSystemsRepo
	worlds      components.WorldsRepo
}

type GalaxyMapOptions struct {
	WorldGen    *worldgen.WorldGen
	StarSystems components.StarSystemsRepo
	Worlds      components.WorldsRepo
}

func New(opts GalaxyMapOptions) game.GalaxyMap {
	galaxy := &galaxyMap{
		generator:   opts.WorldGen,
		starSystems: opts.StarSystems,
		worlds:      opts.Worlds,
	}

	return galaxy
}

func (g *galaxyMap) Start() common.Error {
	grid, err := assets.LoadGalacticGrid()
	if err != nil {
		return err
	}

	g.grid = grid

	logger.Info(logger.FromMessage("galaxy", "Up and running"))

	return nil
}

func (g *galaxyMap) Stop() common.Error {
	logger.Info(logger.FromMessage("galaxy", "Stopping"))
	return nil
}
