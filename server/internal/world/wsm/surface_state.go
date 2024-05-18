package wsm

import (
	"srv/internal/utils/binpack"
	"srv/internal/world"
	"srv/internal/world/worldgen"
	"sync"
)

type SurfaceSharedState struct {
	lock *sync.RWMutex

	id     world.CelestialID
	params world.CelestialBodyParams
}

func NewSurfaceSharedState() *SurfaceSharedState {
	state := &SurfaceSharedState{
		lock: &sync.RWMutex{},
	}

	return state
}

func (state *SurfaceSharedState) FromGeneratedData(data worldgen.GeneratedCelestialData) {
	state.id = data.ID
	state.params = data.Params
}

func (state *SurfaceSharedState) Load(reader *binpack.Reader) {

}

func (state *SurfaceSharedState) Save(writer *binpack.Writer) {}
