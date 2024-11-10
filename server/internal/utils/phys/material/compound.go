package material

import (
	"fmt"
	"srv/internal/utils/color"
	"strings"
)

type compoundComponent struct {
	material *Material
	amount   float64
}

type MaterialCompound struct {
	components  map[MaterialID]*compoundComponent
	totalAmount float64
}

func NewMaterialCompound() *MaterialCompound {
	return &MaterialCompound{
		components:  make(map[MaterialID]*compoundComponent),
		totalAmount: 0,
	}
}

func (mc *MaterialCompound) Add(mat *Material, amount float64) {
	component, alreadyHad := mc.components[mat.GetID()]
	if !alreadyHad {
		component = &compoundComponent{
			material: mat,
			amount:   0,
		}
		mc.components[mat.GetID()] = component
	}
	component.amount += amount
	mc.totalAmount += amount
}
func (mc *MaterialCompound) AddPercentage(mat *Material, percentage float64) {
	mc.Add(mat, percentage*mc.totalAmount)
}

func (mc *MaterialCompound) Remove(mat *Material) {
	component, found := mc.components[mat.GetID()]
	if !found {
		return
	}

	delete(mc.components, mat.GetID())
	mc.totalAmount -= component.amount
}

func (mc *MaterialCompound) ScaleAmountOf(mat *Material, factor float64) {
	component, found := mc.components[mat.GetID()]
	if !found {
		return
	}

	newAmount := component.amount * factor
	mc.totalAmount = mc.totalAmount + newAmount - component.amount
	component.amount = newAmount
}

func (mc *MaterialCompound) TrimNegligibleMaterials(thresholdPercentage float64) []*Material {
	matsToDelete := make([]*Material, 0)
	for _, component := range mc.components {
		percentage := component.amount / mc.totalAmount
		if percentage <= thresholdPercentage {
			matsToDelete = append(matsToDelete, component.material)
			mc.totalAmount -= component.amount
		}
	}

	for _, mat := range matsToDelete {
		delete(mc.components, mat.GetID())
	}

	return matsToDelete
}

func (mc *MaterialCompound) ListMaterials() []*Material {
	mats := make([]*Material, 0, len(mc.components))
	for _, component := range mc.components {
		mats = append(mats, component.material)
	}
	return mats
}

func (mc *MaterialCompound) IsEmpty() bool {
	return mc.totalAmount == 0 || len(mc.components) == 0
}

func (mc *MaterialCompound) Clone() *MaterialCompound {
	clone := NewMaterialCompound()
	for id, component := range mc.components {
		clone.components[id] = &compoundComponent{
			material: component.material,
			amount:   component.amount,
		}
	}
	clone.totalAmount = mc.totalAmount

	return clone
}

func (mc *MaterialCompound) Separate(conditions PhaseDiagramPoint) map[PhysicalState]*MaterialCompound {
	byState := make(map[PhysicalState]*MaterialCompound)

	byState[StateGas] = NewMaterialCompound()
	byState[StateLiquid] = NewMaterialCompound()
	byState[StateSolid] = NewMaterialCompound()

	for _, component := range mc.components {
		state := component.material.SamplePhaseDiagram(conditions)
		byState[state].Add(component.material, component.amount)
	}

	return byState
}

func (mc *MaterialCompound) GetAmountRelativeTo(unit *MaterialCompound) float64 {
	return mc.totalAmount / unit.totalAmount
}

func MergeCompounds(ms ...*MaterialCompound) *MaterialCompound {
	merged := NewMaterialCompound()

	for _, c := range ms {
		for _, component := range c.components {
			merged.Add(component.material, component.amount)
		}
	}

	return merged
}

func (mc *MaterialCompound) GetLightAbsorbtionAt(conditions PhaseDiagramPoint) float64 {
	sum := 0.0
	for _, component := range mc.components {
		state := component.material.SamplePhaseDiagram(conditions)
		color := component.material.GetColorWithEmission(state, conditions.T)
		componentAbsorbtion := color.GetLightAbsorbtion()
		sum += componentAbsorbtion * component.amount / mc.totalAmount
	}

	return sum
}

func (mc *MaterialCompound) GetAverageColorForState(state PhysicalState) color.RichColor {
	result := color.RichColor{}
	if mc.totalAmount == 0.0 {
		return result
	}

	for _, component := range mc.components {
		color := component.material.GetColor(state)
		weight := component.amount / mc.totalAmount
		result.Reflective.R += color.Reflective.R * weight
		result.Reflective.G += color.Reflective.G * weight
		result.Reflective.B += color.Reflective.B * weight

		// TODO: other components too
	}
	return result
}

func (mc *MaterialCompound) GetAverageMolarMass() float64 {
	if mc.totalAmount == 0.0 {
		return 0.0
	}

	sum := 0.0
	for _, component := range mc.components {
		sum += component.material.GetMolarMass() * component.amount
	}
	return sum / mc.totalAmount
}

func (mc *MaterialCompound) GetAverageGreenhouseEffect() float64 {
	if mc.totalAmount == 0.0 {
		return 0.0
	}

	sum := 0.0
	for _, component := range mc.components {
		sum += component.material.GetGreenhouseEffect() * component.amount
	}
	return sum / mc.totalAmount
}

func (mc *MaterialCompound) ToString() string {
	if mc.IsEmpty() {
		return "(empty)"
	}

	var b strings.Builder

	b.WriteString(fmt.Sprintf("(%.3e)", mc.totalAmount))

	for id, component := range mc.components {
		b.WriteString(fmt.Sprintf(", %s %.2f %%", id, component.amount/mc.totalAmount*100))
	}

	return b.String()
}

func (mc *MaterialCompound) ToMap() map[string]float64 {
	result := make(map[string]float64)
	for _, entry := range mc.components {
		result[string(entry.material.GetID())] = entry.amount
	}
	return result
}
