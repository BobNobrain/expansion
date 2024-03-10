package gameworld

import (
	"math/rand"
	"srv/internal/components"
	"srv/internal/utils"
	"srv/internal/utils/common"
	"srv/internal/utils/phys"
	"srv/internal/world"
	"srv/internal/world/planetgen"
)

type GameWorld interface {
	GetSeed() string
	LaunchSimulation() common.Error
}

func NewGameWorld(seed string, dispatcher components.Dispatcher) GameWorld {
	return &gameWorldImpl{
		seed:       seed,
		dispatcher: dispatcher,
		testPlanet: nil,
	}
}

type gameWorldImpl struct {
	seed       string
	dispatcher components.Dispatcher

	testPlanet *world.Planet
}

func (w *gameWorldImpl) GetSeed() string {
	return w.seed
}

func (w *gameWorldImpl) getRandom(additionalSeed string) *rand.Rand {
	return utils.GetSeededRandom(w.seed + ":" + additionalSeed)
}

func (w *gameWorldImpl) LaunchSimulation() common.Error {
	w.testPlanet = planetgen.GenerateSolidPlanet(planetgen.SolidPlanetParams{
		Rnd:    w.getRandom("testPlanet"),
		Radius: phys.Kilometers(6400),
	})

	w.dispatcher.RegisterHandler(w.newWorldDatabase())

	return nil
}
