package globaldata

import (
	"slices"
	"srv/internal/utils/phys/material"
)

type MaterialRegistry struct {
	byId map[material.MaterialID]*material.Material
}

func newMaterialRegistry() *MaterialRegistry {
	return &MaterialRegistry{
		byId: make(map[material.MaterialID]*material.Material),
	}
}

func (r *MaterialRegistry) fill(allMats []*material.Material) {
	for _, mat := range allMats {
		globalMaterialsRegistry.byId[mat.GetID()] = mat
	}
}

func (r *MaterialRegistry) GetByID(id material.MaterialID) *material.Material {
	return r.byId[id]
}

func (r *MaterialRegistry) GetAll() MaterialsList {
	mats := make([]*material.Material, 0, len(r.byId))
	for _, mat := range r.byId {
		mats = append(mats, mat)
	}
	return mats
}

func (r *MaterialRegistry) RestoreCompoundFromMap(data map[string]float64) *material.MaterialCompound {
	mc := material.NewMaterialCompound()

	for id, amount := range data {
		mat := r.byId[material.MaterialID(id)]
		if mat == nil {
			continue
		}
		mc.Add(mat, amount)
	}

	return mc
}

type MaterialsList []*material.Material

func (l MaterialsList) FilterByStateAt(conditions material.PhaseDiagramPoint, allowedStates ...material.PhysicalState) MaterialsList {
	result := make(MaterialsList, 0)
	for _, mat := range l {
		actualState := mat.SamplePhaseDiagram(conditions)
		if slices.Index(allowedStates, actualState) != -1 {
			result = append(result, mat)
		}
	}
	return result
}

func (l MaterialsList) FilterByHasAnyTag(tags ...string) MaterialsList {
	result := make(MaterialsList, 0)
	for _, mat := range l {
		if mat.HasAnyTag(tags...) {
			result = append(result, mat)
		}
	}
	return result
}
