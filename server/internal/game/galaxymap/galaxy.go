package galaxymap

import (
	"srv/internal/components"
	"srv/internal/game"
	"srv/internal/globals/logger"
	"srv/internal/utils/common"
	"srv/internal/world"
	"srv/internal/world/worldgen"
	"srv/internal/world/wsm"
	"sync"
)

type galaxyMap struct {
	lock *sync.RWMutex

	grid         world.GalacticGrid
	beacons      []world.GalaxyBeacon
	sectors      map[world.GalacticSectorID][]*wsm.SystemSharedState
	systemsByID  map[world.StarSystemID]*wsm.SystemSharedState
	surfacesByID map[world.CelestialID]*wsm.SurfaceSharedState

	generator *worldgen.WorldGen

	starSystems components.BlobsRepo
	precalcs    components.BlobsRepo
	dispatcher  components.Dispatcher
}

type GalaxyMapOptions struct {
	WorldGen    *worldgen.WorldGen
	StarSystems components.BlobsRepo
	Precalcs    components.BlobsRepo
	Dispatcher  components.Dispatcher
}

func New(opts GalaxyMapOptions) game.GalaxyMap {
	galaxy := &galaxyMap{
		lock:         new(sync.RWMutex),
		systemsByID:  make(map[world.StarSystemID]*wsm.SystemSharedState),
		surfacesByID: make(map[world.CelestialID]*wsm.SurfaceSharedState),

		generator:   opts.WorldGen,
		starSystems: opts.StarSystems,
		precalcs:    opts.Precalcs,
		dispatcher:  opts.Dispatcher,
	}

	return galaxy
}

func (g *galaxyMap) Start() common.Error {
	logger.Info(logger.FromMessage("galaxy", "Starting up a galaxy runner"))

	g.lock.Lock()
	defer g.lock.Unlock()

	err := g.loadGrid()
	if err != nil {
		return err
	}
	err = g.loadSystems()
	if err != nil {
		return err
	}
	err = g.loadSurfacesData()
	if err != nil {
		return err
	}

	g.loadBeacons()
	g.loadSectorContents()

	logger.Info(logger.FromMessage("galaxy", "Loaded and initialized all system states"))

	return nil
}

func (g *galaxyMap) Stop() common.Error {
	logger.Info(logger.FromMessage("galaxy", "Stopping"))
	return nil
}
