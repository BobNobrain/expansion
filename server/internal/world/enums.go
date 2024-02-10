package world

import (
	"srv/internal/utils/geom"
)

type PlanetConfig struct {
	SurfaceRadiusKm float64
	LandmassPercent float64
	Density         float64

	AtmosphereRadiusKm   float64
	AtmosphereDensityBar float64

	IncomingHeat float64
	CoreHeat     float64
}

func (p *PlanetConfig) HasSurface() bool {
	return p.SurfaceRadiusKm > 0
}
func (p *PlanetConfig) HasContinents() bool {
	return p.LandmassPercent > 0
}
func (p *PlanetConfig) HasOceans() bool {
	return p.LandmassPercent < 1
}
func (p *PlanetConfig) HasAtmosphere() bool {
	return p.AtmosphereDensityBar > 0
}

func (p *PlanetConfig) SolidMass() float64 {
	return p.Density * geom.SphereVolume(p.SurfaceRadiusKm)
}
func (p *PlanetConfig) FullMass() float64 {
	solidV := geom.SphereVolume(p.SurfaceRadiusKm)
	atmV := geom.SphereVolume(p.AtmosphereRadiusKm) - solidV
	solidMass := p.Density * solidV
	// TODO: more accurate formula for atmosphere mass
	atmMass := p.AtmosphereDensityBar * atmV
	return solidMass + atmMass
}

type PlanetLayer struct {
	RadiusKm     float64
	AverageTempC float64
	PressureBar  float64
}

const gravityConstant float64 = 6.674e-2

func (p *PlanetConfig) GetSurfaceG() float64 {
	return p.SolidMass() * gravityConstant / (p.SurfaceRadiusKm * p.SurfaceRadiusKm)
}

func (p *PlanetConfig) IsPotentiallyHabitable() bool {
	return true
}

func (p *PlanetConfig) IsFertile() bool {
	return true
}
