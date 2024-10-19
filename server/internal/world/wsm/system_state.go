package wsm

import (
	"encoding/json"
	"srv/internal/domain"
	"srv/internal/utils/common"
	"srv/internal/world"
	"srv/internal/world/worldgen"
	"sync"
	"time"
)

type SystemSharedState struct {
	lock *sync.RWMutex

	systemID world.StarSystemID
	coords   world.GalacticCoords

	isExplored bool
	// TODO: this is probably a temporary solution,
	// need to move this into a table or smth
	exploredAt time.Time
	exploredBy domain.UserID

	orbits     map[world.CelestialID]world.OrbitData
	stars      []*world.Star
	nPlanets   int
	nAsteroids int

	gen *worldgen.WorldGen
}

const StaticSystemDataFormat string = "static_sys"

func NewSystemSharedState(gen *worldgen.WorldGen, id world.StarSystemID) *SystemSharedState {
	state := &SystemSharedState{
		lock:     &sync.RWMutex{},
		systemID: id,

		gen:    gen,
		orbits: make(map[world.CelestialID]world.OrbitData),
	}

	return state
}

// next methods return constant values – they do not change for the entire
// object lifetime, and thus can be read without mutex locking

func (state *SystemSharedState) GetSystemID() world.StarSystemID {
	return state.systemID
}

func (state *SystemSharedState) GetStars() []*world.Star {
	return state.stars
}

func (state *SystemSharedState) GetCoords() world.GalacticCoords {
	return state.coords
}

// next getter methods require a read lock

func (state *SystemSharedState) GetNPlanets() int {
	state.lock.RLock()
	defer state.lock.RUnlock()

	// TODO: get only planets count, not moons
	return state.nPlanets
}

func (state *SystemSharedState) GetNStars() int {
	state.lock.RLock()
	defer state.lock.RUnlock()

	return len(state.stars)
}

func (state *SystemSharedState) GenNAsteroids() int {
	state.lock.RLock()
	defer state.lock.RUnlock()

	return state.nAsteroids
}

func (state *SystemSharedState) GetOrbits() map[world.CelestialID]world.OrbitData {
	state.lock.RLock()
	defer state.lock.RUnlock()

	return state.orbits
}

func (state *SystemSharedState) IsExplored() bool {
	state.lock.RLock()
	defer state.lock.RUnlock()

	return state.isExplored
}
func (state *SystemSharedState) GetExploredBy() domain.UserID {
	state.lock.RLock()
	defer state.lock.RUnlock()

	return state.exploredBy
}
func (state *SystemSharedState) GetExploredAt() time.Time {
	state.lock.RLock()
	defer state.lock.RUnlock()

	return state.exploredAt
}

// all methods below require a write lock, because they modify the state

func (system *SystemSharedState) FillFromGeneratedData(data worldgen.GeneratedStarSystemData) {
	system.lock.Lock()
	defer system.lock.Unlock()

	system.coords = data.Coords
	system.stars = data.Stars
	system.orbits = data.Orbits
}

func (system *SystemSharedState) FillFromExplorationData(explorer domain.UserID, data worldgen.GeneratedStarSystemData) {
	system.lock.Lock()
	defer system.lock.Unlock()

	if system.isExplored {
		return
	}

	system.isExplored = true
	system.exploredBy = explorer
	system.exploredAt = time.Now()

	system.orbits = data.Orbits
	system.nPlanets = len(data.Bodies)
}

// save-load operations

type systemStateData struct {
	Coords world.GalacticCoords

	IsExplored bool
	ExploredAt time.Time
	ExploredBy domain.UserID

	Orbits     map[world.CelestialID]world.OrbitData
	Stars      []world.Star
	NPlanets   int
	NAsteroids int
}

func (system *SystemSharedState) SaveState() (*domain.OpaqueBlob, common.Error) {
	system.lock.RLock()
	defer system.lock.RUnlock()

	blob := &domain.OpaqueBlob{
		ID:      string(system.systemID),
		Format:  StaticSystemDataFormat,
		Version: 1,
	}

	starsData := make([]world.Star, 0, len(system.stars))
	for _, star := range system.stars {
		starsData = append(starsData, *star)
	}
	data := systemStateData{
		Coords:     system.coords,
		IsExplored: system.isExplored,
		ExploredAt: system.exploredAt,
		ExploredBy: system.exploredBy,
		Orbits:     system.orbits,
		Stars:      starsData,
		NPlanets:   system.nPlanets,
		NAsteroids: system.nAsteroids,
	}
	marshalled, err := json.Marshal(data)
	if err != nil {
		return nil, newSaveError(err)
	}
	blob.Data = marshalled

	return blob, nil
}

func (system *SystemSharedState) LoadState(from *domain.OpaqueBlob) common.Error {
	system.lock.Lock()
	defer system.lock.Unlock()

	var data systemStateData
	err := json.Unmarshal(from.Data, &data)
	if err != nil {
		return newLoadError(err)
	}

	system.coords = data.Coords
	system.isExplored = data.IsExplored
	system.exploredAt = data.ExploredAt
	system.exploredBy = data.ExploredBy
	system.orbits = data.Orbits
	system.nPlanets = data.NPlanets
	system.nAsteroids = data.NAsteroids

	system.stars = make([]*world.Star, 0, len(data.Stars))
	for _, star := range data.Stars {
		system.stars = append(system.stars, &star)
	}

	return nil
}
