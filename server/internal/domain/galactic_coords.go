package domain

import "math"

type GalacticCoordsRadius float64
type GalacticCoordsAngle float64
type GalacticCoordsHeight float64

type GalacticCoords struct {
	R     GalacticCoordsRadius
	Theta GalacticCoordsAngle
	H     GalacticCoordsHeight
}

const fullAngle GalacticCoordsAngle = math.Pi * 2

const rEps GalacticCoordsRadius = 0.01
const hEps GalacticCoordsHeight = 0.001
const thetaEpsAtUnitR GalacticCoordsAngle = fullAngle / 360

const InnerRimRadius GalacticCoordsRadius = 0.2
const OuterRimRadius GalacticCoordsRadius = 2
const MaxHeightDispacement GalacticCoordsHeight = 0.1

func normalizeTheta(theta GalacticCoordsAngle) GalacticCoordsAngle {
	for theta < 0 {
		theta += fullAngle
	}
	for theta >= fullAngle {
		theta -= fullAngle
	}
	return theta
}

func (c GalacticCoords) NormalizedAngle() GalacticCoordsAngle {
	return normalizeTheta(c.Theta)
}
func (c1 GalacticCoords) IsCloseTo(c2 GalacticCoords) bool {
	if math.Abs(float64(c1.R-c2.R)) > float64(rEps) {
		return false
	}
	if math.Abs(float64(c1.H-c2.H)) > float64(hEps) {
		return false
	}

	thetaEps := math.Max(float64(c1.R), float64(c2.R)) * float64(thetaEpsAtUnitR)
	return math.Abs(float64(c1.Theta-c2.Theta)) < thetaEps
}

type GalacticSectorCoords struct {
	InnerR     GalacticCoordsRadius
	OuterR     GalacticCoordsRadius
	ThetaStart GalacticCoordsAngle
	ThetaEnd   GalacticCoordsAngle
}

func (s GalacticSectorCoords) IsRadiusInside(r GalacticCoordsRadius) bool {
	return s.InnerR <= r && r < s.OuterR
}
func (s GalacticSectorCoords) IsThetaInside(theta GalacticCoordsAngle) bool {
	normalized := normalizeTheta(theta)
	if s.ThetaStart <= normalized && normalized < s.ThetaEnd {
		return true
	}
	normalized += fullAngle
	if s.ThetaStart <= normalized && normalized < s.ThetaEnd {
		return true
	}
	return false
}
func (s GalacticSectorCoords) IsHeightInside(h GalacticCoordsHeight) bool {
	return true
}

func (s GalacticSectorCoords) IsInside(point GalacticCoords) bool {
	if !s.IsRadiusInside(point.R) {
		return false
	}

	if !s.IsThetaInside(point.Theta) {
		return false
	}

	return s.IsHeightInside(point.H)
}

func (s GalacticSectorCoords) GetCenter() GalacticCoords {
	return GalacticCoords{
		R:     s.InnerR + (s.OuterR-s.InnerR)/2,
		Theta: s.ThetaStart + (s.ThetaEnd-s.ThetaStart)/2,
		H:     0,
	}
}
