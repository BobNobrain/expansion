package game

import (
	"srv/internal/components"
	"srv/internal/components/runner"
	"srv/internal/utils/common"
)

type game struct {
	r components.Runner
}

type GameComponents struct {
	Dispatcher components.Dispatcher
	GalaxyMap  GalaxyMap
}

func New(opts GameComponents) components.Runner {
	game := &game{}

	game.r = runner.NewMultipleRunner([]components.Runner{
		opts.GalaxyMap,
	})

	opts.Dispatcher.RegisterHandler(newGalaxyHandler(opts.GalaxyMap))

	return game
}

func (g *game) Start() common.Error {
	return g.r.Start()
}

func (g *game) Stop() common.Error {
	return g.r.Stop()
}
