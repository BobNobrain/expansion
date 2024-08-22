package material

import (
	"srv/internal/utils"
	"srv/internal/utils/color"
	"srv/internal/utils/phys"
)

type MaterialID string

type Material struct {
	id     MaterialID
	phases PhaseDiagram

	colorsByState map[PhysicalState]color.RichColor
	tags          map[string]bool

	// g/mol
	molarMass float64

	wgAbundanceMin float64
	wgAbundanceMax float64
}

func (m *Material) GetID() MaterialID {
	return m.id
}

func (m *Material) SamplePhaseDiagram(at PhaseDiagramPoint) PhysicalState {
	return m.phases.Sample(at)
}

func (m *Material) GetColor(state PhysicalState, t phys.Temperature) color.RichColor {
	clr := m.colorsByState[state]
	k := t.Kelvins()
	if k > 700 {
		clr.EmissionIntensity = utils.Clamp(utils.Unlerp(700, 1200, k), 0, 1)
		clr.Emissive = color.ToRichColorRGB(t.GetHeatColor())
	}

	return clr
}

func (m *Material) GetMolarMass() float64 {
	return m.molarMass
}

func (m *Material) GetAbundance(unitRandom float64) float64 {
	return utils.Lerp(m.wgAbundanceMin, m.wgAbundanceMax, unitRandom)
}

func (m *Material) HasAnyTag(tags ...string) bool {
	for _, tag := range tags {
		if m.tags[tag] {
			return true
		}
	}
	return true
}

// just an utility to build a proper material object
type MaterialConstructor struct {
	result *Material
}

func NewMaterial(id string) *MaterialConstructor {
	mat := &Material{
		id:            MaterialID(id),
		colorsByState: make(map[PhysicalState]color.RichColor),
		tags:          make(map[string]bool),
	}
	return &MaterialConstructor{result: mat}
}

func (m *MaterialConstructor) Result() *Material {
	return m.result
}

func (m *MaterialConstructor) SetColorFor(state PhysicalState, value color.RichColor) {
	m.result.colorsByState[state] = value
}

func (m *MaterialConstructor) SetTags(tags []string) {
	for _, tag := range tags {
		m.result.tags[tag] = true
	}
}

func (m *MaterialConstructor) SetPhaseDiagram(d PhaseDiagram) {
	m.result.phases = d
}

func (m *MaterialConstructor) SetMolarMass(gPerMol float64) {
	m.result.molarMass = gPerMol
}

func (m *MaterialConstructor) SetAbundance(min, max float64) {
	m.result.wgAbundanceMin = min
	m.result.wgAbundanceMax = max
}
