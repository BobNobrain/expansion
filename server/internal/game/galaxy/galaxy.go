package galaxy

import (
	"srv/internal/components"
	"srv/internal/components/updater"
	"srv/internal/globals/logger"
	"srv/internal/utils/common"
	"srv/internal/world"
	"srv/internal/world/worldgen"
	"srv/internal/world/wsm"
	"time"
)

type gameGalaxy struct {
	// lock *sync.RWMutex

	grid        world.GalacticGrid
	systemsById map[world.StarSystemID]*wsm.SystemSharedState
	beacons     []world.GalaxyBeacon
	sectors     map[world.GalacticSectorID][]*wsm.SystemSharedState

	generator   *worldgen.WorldGen
	updater     components.Updater
	starSystems components.BlobsRepo
	precalcs    components.BlobsRepo
	dispatcher  components.Dispatcher

	autosaveInterval time.Duration
}

type GameGalaxyOptions struct {
	WorldGen    *worldgen.WorldGen
	StarSystems components.BlobsRepo
	Precalcs    components.BlobsRepo
	Dispatcher  components.Dispatcher

	AutoSaveInterval time.Duration
}

func NewGameGalaxy(opts GameGalaxyOptions) components.Runner {
	runner := &gameGalaxy{
		// lock:        new(sync.RWMutex),
		systemsById: make(map[world.StarSystemID]*wsm.SystemSharedState),

		generator:   opts.WorldGen,
		updater:     updater.NewUpdater(),
		starSystems: opts.StarSystems,
		precalcs:    opts.Precalcs,
		dispatcher:  opts.Dispatcher,

		autosaveInterval: opts.AutoSaveInterval,
	}

	return runner
}

func (g *gameGalaxy) Start() common.Error {
	logger.Info(logger.FromMessage("galaxy", "Starting up a galaxy runner"))
	g.updater.Start()

	// g.lock.Lock()
	// defer g.lock.Unlock()

	err := g.loadGrid()
	if err != nil {
		return err
	}
	err = g.loadSystems()
	if err != nil {
		return err
	}

	g.loadBeacons()
	g.loadSectorContents()

	logger.Info(logger.FromMessage("galaxy", "Loaded and initialized all system states"))

	g.dispatcher.RegisterHandler(newGalaxyHandler(g))

	g.scheduleAutoUpdate()

	return nil
}

func (g *gameGalaxy) Stop() common.Error {
	logger.Info(logger.FromMessage("galaxy", "Stopping"))

	g.updater.Stop()

	errors := g.saveState()
	for _, err := range errors {
		logger.Error(logger.FromError("galaxy", err))
	}

	return nil
}
