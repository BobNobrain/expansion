package wsm

import (
	"encoding/json"
	"srv/internal/domain"
	"srv/internal/utils/common"
	"srv/internal/utils/phys"
	"srv/internal/world"
	"srv/internal/world/planetgen"
	"srv/internal/world/worldgen"
	"sync"
)

const StaticSurfaceDataFormat string = "static_sur"

type SurfaceSharedState struct {
	lock *sync.RWMutex

	id         world.CelestialID
	params     world.CelestialSurfaceParams
	isExplored bool

	grid           world.PlanetaryGrid
	conditions     world.SurfaceConditions
	tileConditions []tileData
	ocean          planetgen.GeneratedOceans
	atm            planetgen.GeneratedAtmosphere
	elevationScale phys.Distance
}

type tileData struct {
	BiomeColor string
	Elevation  float64
	AvgTemp    phys.Temperature
	Pressure   phys.Pressure
	Surface    world.BiomeSurface
}

func NewSurfaceSharedState() *SurfaceSharedState {
	state := &SurfaceSharedState{
		lock: new(sync.RWMutex),
	}

	return state
}

func (state *SurfaceSharedState) FromGeneratedData(data worldgen.GeneratedCelestialData) {
	state.lock.Lock()
	defer state.lock.Unlock()

	state.id = data.ID
	state.params = data.Params
}

func (state *SurfaceSharedState) FromExplorationData(data *planetgen.GeneratedSurfaceData) {
	state.lock.Lock()
	defer state.lock.Unlock()

	state.grid = data.Grid
	state.atm = data.Atmosphere
	state.ocean = data.Oceans
	state.isExplored = true

	state.conditions = world.SurfaceConditions{
		Pressure: data.Atmosphere.SeaLevelPressure,
		AvgTemp:  data.Atmosphere.AverageTemp,
		Gravity:  phys.CalculatePlanetGravity(data.Params.Mass, data.Params.Radius),
	}

	state.elevationScale = data.RelativeElevationsScale

	state.tileConditions = make([]tileData, 0, len(data.Tiles))
	for _, generatedTile := range data.Tiles {
		state.tileConditions = append(state.tileConditions, tileData{
			BiomeColor: "#bbb",
			Elevation:  generatedTile.Elevation,
			AvgTemp:    generatedTile.AverageTemp,
			Pressure:   generatedTile.Pressure,
			Surface:    generatedTile.SurfaceType,
		})
	}
}

func (state *SurfaceSharedState) GetID() world.CelestialID {
	state.lock.RLock()
	defer state.lock.RUnlock()

	return state.id
}

func (state *SurfaceSharedState) GetSize() int {
	state.lock.RLock()
	defer state.lock.RUnlock()

	if state.isExplored {
		return state.grid.GetNodesCount()
	}

	return 0
}

func (state *SurfaceSharedState) GetParams() world.CelestialSurfaceParams {
	state.lock.RLock()
	defer state.lock.RUnlock()

	return state.params
}

func (state *SurfaceSharedState) GetConditions() world.SurfaceConditions {
	state.lock.RLock()
	defer state.lock.RUnlock()

	return state.conditions
}

func (state *SurfaceSharedState) IsExplored() bool {
	state.lock.RLock()
	defer state.lock.RUnlock()

	return state.isExplored
}

func (state *SurfaceSharedState) GetGrid() world.PlanetaryGrid {
	state.lock.RLock()
	defer state.lock.RUnlock()

	return state.grid
}

func (state *SurfaceSharedState) GetTileConditions() []world.SurfaceTileConditions {
	state.lock.RLock()
	defer state.lock.RUnlock()

	result := make([]world.SurfaceTileConditions, 0, len(state.tileConditions))
	for _, td := range state.tileConditions {
		result = append(result, world.SurfaceTileConditions{
			BiomeColor: td.BiomeColor,
			AvgTemp:    td.AvgTemp,
			Pressure:   td.Pressure,
			Surface:    td.Surface,
			Elevation:  state.elevationScale.Mul(td.Elevation),
		})
	}

	return result
}

type surfaceStateSerializedData struct {
	Params     world.CelestialSurfaceParams
	IsExplored bool

	Grid  world.PlanetaryGridRawData
	Conds world.SurfaceConditions
	Tiles []tileData
	Ocean planetgen.GeneratedOceans
	Atm   planetgen.GeneratedAtmosphere
	Elev  phys.Distance
}

func (state *SurfaceSharedState) LoadState(blob *domain.OpaqueBlob) common.Error {
	state.lock.Lock()
	defer state.lock.Unlock()

	var data surfaceStateSerializedData
	err := json.Unmarshal(blob.Data, &data)
	if err != nil {
		return newLoadError(err)
	}

	state.id = world.CelestialID(blob.ID)
	state.params = data.Params
	state.isExplored = data.IsExplored

	state.grid = world.NewGridFromRawData(data.Grid)
	state.conditions = data.Conds
	state.tileConditions = data.Tiles
	state.ocean = data.Ocean
	state.atm = data.Atm
	state.elevationScale = data.Elev

	return nil
}

func (state *SurfaceSharedState) SaveState() (*domain.OpaqueBlob, common.Error) {
	state.lock.RLock()
	defer state.lock.RUnlock()

	data := surfaceStateSerializedData{
		Params:     state.params,
		IsExplored: state.isExplored,

		Grid:  state.grid.ToRawData(),
		Conds: state.conditions,
		Tiles: state.tileConditions,
		Ocean: state.ocean,
		Atm:   state.atm,
		Elev:  state.elevationScale,
	}

	marshalled, err := json.Marshal(data)
	if err != nil {
		return nil, newSaveError(err)
	}

	blob := &domain.OpaqueBlob{
		ID:      string(state.id),
		Format:  StaticSurfaceDataFormat,
		Version: 1,
		Data:    marshalled,
	}

	return blob, nil
}
