package worldgen

import (
	"srv/internal/utils/phys"
)

type RockyPlanetModelData struct {
	surfaceRadius        phys.Distance
	density              phys.Density
	magneticFieldStrengh float64
	incomingHeat         float64
	solarWindStrength    float64

	solidMass       phys.Mass
	seaLevelG       phys.Acceleration
	seaLevelEscapeV phys.Speed

	atmosphereMass   phys.Mass
	seaLevelPressure phys.Pressure
}

func (p *RockyPlanetModelData) SetSurfaceRadius(r phys.Distance) *RockyPlanetModelData {
	p.surfaceRadius = r
	return p
}
func (p *RockyPlanetModelData) SetDensity(d phys.Density) *RockyPlanetModelData {
	p.density = d
	return p
}
func (p *RockyPlanetModelData) SetMagneticFieldStrength(mgs float64) *RockyPlanetModelData {
	p.magneticFieldStrengh = mgs
	return p
}
func (p *RockyPlanetModelData) SetIncomingHeat(heat float64) *RockyPlanetModelData {
	p.incomingHeat = heat
	return p
}
func (p *RockyPlanetModelData) SetSolarWindStrength(wind float64) *RockyPlanetModelData {
	p.solarWindStrength = wind
	return p
}

func (p *RockyPlanetModelData) Calculate() {
	p.calculateGravity()
	p.calculateAtmosphere()
}

func (p *RockyPlanetModelData) calculateGravity() {
	p.solidMass = phys.FromVolumeAndDensity(phys.SphereVolume(p.surfaceRadius), p.density)
	p.seaLevelG = phys.CalculatePlanetGravity(p.solidMass, p.surfaceRadius)
	p.seaLevelEscapeV = phys.CalculatePlanetEscapeVelocity(p.solidMass, p.surfaceRadius)
}

func (p *RockyPlanetModelData) calculateAtmosphere() {

}
