package phys

import (
	"math"
	"srv/internal/utils/geom"
)

type EllipticOrbit struct {
	SemiMajor    Distance
	Eccentricity float64
}

// Calculates semi-minor axis of the ellipse
func (ellipse EllipticOrbit) SemiMinor() Distance {
	return ellipse.SemiMajor.Mul(math.Sqrt(1 - ellipse.Eccentricity*ellipse.Eccentricity))
}

func (ellipse EllipticOrbit) Apoapsis() Distance {
	return ellipse.SemiMajor.Mul(ellipse.Eccentricity + 1)
}
func (ellipse EllipticOrbit) Periapsis() Distance {
	return ellipse.SemiMajor.Mul(1 - ellipse.Eccentricity)
}
func (ellipse EllipticOrbit) AverageDistance() Distance {
	return ellipse.Apoapsis().Add(ellipse.Periapsis()).Mul(0.5)
}

// Calculates distance from main focus to position on ellipse determined by theta.
// Main focus is the one closest to point on ellipse where theta=0, i.e. to periapsis.
func (ellipse EllipticOrbit) DistanceAtTheta(theta geom.Angle) Distance {
	l := ellipse.SemiMajor.Mul(1 - ellipse.Eccentricity*ellipse.Eccentricity)
	divisor := 1 + ellipse.Eccentricity*theta.Cos()
	return l.Mul(1 / divisor)
}

func (orbit EllipticOrbit) WithMasses(parent Mass, child Mass) KeplerOrbit {
	return KeplerOrbit{
		Ellipse:    orbit,
		ParentMass: parent,
		ChildMass:  child,
	}
}

type KeplerOrbit struct {
	Ellipse EllipticOrbit

	ParentMass Mass
	ChildMass  Mass
}

const keplerPeriodConstant = 4 * math.Pi * math.Pi / gravityConstant

func (orbit KeplerOrbit) Period() PhysicalTime {
	a := orbit.Ellipse.SemiMajor.Kilometers()
	sumMasses := orbit.ParentMass.Kilograms() + orbit.ChildMass.Kilograms()
	return Seconds(math.Sqrt(keplerPeriodConstant * a / sumMasses * a * a))
}

func (orbit KeplerOrbit) HillSphereRadius() Distance {
	massRelation := orbit.ChildMass.SolarMasses() / orbit.ParentMass.SolarMasses()
	return orbit.Ellipse.SemiMajor.Mul(math.Cbrt(massRelation / 3))
}

func (orbit KeplerOrbit) CalculateTheta(when PhysicalTime, th0 geom.Angle) geom.Angle {
	p := orbit.Period()
	for when >= p {
		when -= p
	}

	// TODO: actually figure out this formula somehow
	return geom.FullCircles(0)
}
