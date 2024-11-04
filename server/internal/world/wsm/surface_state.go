package wsm

import (
	"encoding/json"
	"srv/internal/domain"
	"srv/internal/utils/color"
	"srv/internal/utils/common"
	"srv/internal/utils/geom"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
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

	grid           geom.SpatialGraph
	conditions     world.SurfaceConditions
	tileConditions []tileData
	ocean          planetgen.GeneratedOceans
	atm            planetgen.GeneratedAtmosphere
	elevationScale phys.Distance
}

type tileData struct {
	BiomeColor color.RichColor
	Elevation  float64
	AvgTemp    phys.Temperature
	Pressure   phys.Pressure
	Surface    world.BiomeSurface
}

func NewSurfaceSharedState(id world.CelestialID) *SurfaceSharedState {
	state := &SurfaceSharedState{
		id:   id,
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
		Gravity:  phys.CalculatePlanetGravity(state.params.Mass, state.params.Radius),
	}

	state.elevationScale = data.RelativeElevationsScale

	state.tileConditions = make([]tileData, 0, len(data.Tiles))
	crustColor := data.Crust.GetAverageColorForState(material.StateSolid)
	oceanColor := data.Oceans.Contents.GetAverageColorForState(material.StateLiquid)
	for _, generatedTile := range data.Tiles {
		td := tileData{
			BiomeColor: crustColor,
			Elevation:  generatedTile.Elevation,
			AvgTemp:    generatedTile.AverageTemp,
			Pressure:   generatedTile.Pressure,
			Surface:    generatedTile.SurfaceType,
		}
		if generatedTile.SurfaceType == world.BiomeSurfaceLiquid {
			td.BiomeColor = oceanColor
		}
		state.tileConditions = append(state.tileConditions, td)
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
		return state.grid.Size()
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

func (state *SurfaceSharedState) GetGrid() geom.SpatialGraph {
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

func (state *SurfaceSharedState) GetComposition() world.SurfaceComposition {
	state.lock.RLock()
	defer state.lock.RUnlock()

	result := world.SurfaceComposition{
		OceanLevel: state.ocean.Level,
		Oceans:     state.ocean.Contents,
		Atmosphere: state.atm.Contents,
	}

	return result
}

type surfaceStateSerializedData struct {
	Params     world.CelestialSurfaceParams
	IsExplored bool

	Grid  surfaceStateSerializedGridData
	Conds world.SurfaceConditions
	Tiles []tileData
	Ocean planetgen.GeneratedOceans
	Atm   planetgen.GeneratedAtmosphere
	Elev  phys.Distance
}

type surfaceStateSerializedGridData struct {
	Coords      []geom.Vec3
	Connections [][]int
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

	state.grid = geom.RestoreSpatialGraph(data.Grid.Coords, data.Grid.Connections)
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

		Grid: surfaceStateSerializedGridData{
			Coords:      state.grid.GetAllCoords(),
			Connections: state.grid.GetUnduplicatedConnections(),
		},
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
