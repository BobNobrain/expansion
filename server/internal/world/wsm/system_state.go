package wsm

import (
	"bytes"
	"srv/internal/domain"
	"srv/internal/utils/binpack"
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

	orbits   map[world.CelestialID]world.OrbitData
	stars    []*world.Star
	surfaces []*SurfaceSharedState

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

func (system *SystemSharedState) SaveState() (*domain.OpaqueBlob, common.Error) {
	system.lock.RLock()
	defer system.lock.RUnlock()

	result := &domain.OpaqueBlob{
		ID:      string(system.systemID),
		Format:  StaticSystemDataFormat,
		Version: 1,
	}

	buf := new(bytes.Buffer)
	w := binpack.NewWriter(buf)

	binpack.Write(w, system.coords)

	binpack.Write(w, system.isExplored)
	binpack.Write(w, system.exploredAt.UnixMilli())
	binpack.Write(w, system.exploredBy)

	binpack.Write(w, system.orbits)
	binpack.Write(w, system.stars)

	w.WriteUVarInt(uint64(len(system.surfaces)))
	for _, surfaceState := range system.surfaces {
		surfaceState.Save(w)
	}

	if w.GetError() != nil {
		return nil, newSaveError(w.GetError())
	}

	result.Data = buf.Bytes()
	return result, nil
}

func (state *SystemSharedState) GetNPlanets() int {
	state.lock.RLock()
	defer state.lock.RUnlock()

	// TODO: get only planets count, not moons
	return len(state.surfaces)
}

// GetNStars implements world.StarSystem.
func (state *SystemSharedState) GetNStars() int {
	state.lock.RLock()
	defer state.lock.RUnlock()

	return len(state.stars)
}

// GenNAsteroids implements world.StarSystem.
func (state *SystemSharedState) GenNAsteroids() int {
	state.lock.RLock()
	defer state.lock.RUnlock()

	// TODO
	return 0
}

// GetOrbits implements world.StarSystem.
func (state *SystemSharedState) GetOrbits() map[world.CelestialID]world.OrbitData {
	state.lock.RLock()
	defer state.lock.RUnlock()

	return state.orbits
}

// GetSurfaces implements world.StarSystem.
func (state *SystemSharedState) GetSurfaces() []world.CelestialSurface {
	state.lock.RLock()
	defer state.lock.RUnlock()

	// TODO
	return make([]world.CelestialSurface, 0)
}

// IsExplored implements world.StarSystem.
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

func (system *SystemSharedState) LoadState(from *domain.OpaqueBlob) common.Error {
	system.lock.Lock()
	defer system.lock.Unlock()

	r := binpack.NewReaderFromBytes(from.Data)

	system.coords = binpack.Read[world.GalacticCoords](r)

	system.isExplored = binpack.Read[bool](r)
	system.exploredAt = time.UnixMilli(binpack.Read[int64](r))
	system.exploredBy = binpack.Read[domain.UserID](r)

	system.orbits = binpack.Read[map[world.CelestialID]world.OrbitData](r)

	stars := binpack.Read[[]world.Star](r)
	system.stars = make([]*world.Star, 0, len(stars))
	for _, star := range stars {
		star := star // screw you, golang
		system.stars = append(system.stars, &star)
	}

	nBodies := r.ReadUVarInt()
	system.surfaces = make([]*SurfaceSharedState, 0, nBodies)
	for i := 0; i < int(nBodies); i++ {
		surfaceState := NewSurfaceSharedState()
		surfaceState.Load(r)
		system.surfaces = append(system.surfaces, surfaceState)
	}

	if r.GetError() != nil {
		return newLoadError(r.GetError())
	}

	return nil
}

func (system *SystemSharedState) FillFromGeneratedData(data *worldgen.GeneratedStarSystemData) {
	system.lock.Lock()
	defer system.lock.Unlock()

	system.coords = data.Coords
	system.stars = data.Stars
	system.orbits = data.Orbits
}

func (system *SystemSharedState) Explore(explorer domain.UserID) {
	system.lock.Lock()
	defer system.lock.Unlock()

	if system.isExplored {
		return
	}

	system.isExplored = true
	system.exploredBy = explorer
	system.exploredAt = time.Now()

	data := system.gen.Explore(worldgen.ExploreOptions{
		SystemID: system.systemID,
		Stars:    system.stars,
		Orbits:   system.orbits,
	})

	system.orbits = data.Orbits
	for _, body := range data.Bodies {
		surfaceState := NewSurfaceSharedState()
		surfaceState.FromGeneratedData(body)
		system.surfaces = append(system.surfaces, surfaceState)
	}
}
