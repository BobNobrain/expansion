package gameworld

import (
	"hash/fnv"
	"math"
	"math/rand"
	"srv/internal/domain"
	"srv/internal/utils/common"
	"srv/internal/utils/phys"
	"srv/internal/world"
	"srv/internal/world/planetgen"
)

type GameWorld interface {
	GetSeed() string
	LaunchSimulation() common.Error
}

func NewGameWorld(seed string, dispatcher domain.Dispatcher) GameWorld {
	return &gameWorldImpl{
		seed:       seed,
		dispatcher: dispatcher,
		testPlanet: nil,
	}
}

type gameWorldImpl struct {
	seed       string
	dispatcher domain.Dispatcher

	testPlanet *world.Planet
}

func (w *gameWorldImpl) GetSeed() string {
	return w.seed
}

func (w *gameWorldImpl) getRandom(additionalSeed string) *rand.Rand {
	seed := w.seed + ":" + additionalSeed

	hash := fnv.New64a()
	hash.Write([]byte(seed))
	usum := hash.Sum64()

	sum := int64(usum)
	if usum > math.MaxInt64 {
		sum = -int64(usum - math.MaxInt64)
	}

	source := rand.NewSource(sum)
	rnd := rand.New(source)

	return rnd
}

func (w *gameWorldImpl) LaunchSimulation() common.Error {
	w.testPlanet = planetgen.GenerateSolidPlanet(planetgen.SolidPlanetParams{
		Rnd:    w.getRandom("testPlanet"),
		Radius: phys.Kilometers(6400),
	})

	w.dispatcher.RegisterHandler(w.newWorldDatabase())

	return nil
}
