package world

import "srv/internal/utils/geom"

type PlanetaryFeatureType byte

const (
	FeatureTypeOcean         PlanetaryFeatureType = iota
	FeatureTypeContinent     PlanetaryFeatureType = iota
	FeatureTypeMountainRidge PlanetaryFeatureType = iota
)

type PlanetaryFeature struct {
	Name string
	Type PlanetaryFeatureType
}

type PlanetaryFeatureLabel struct {
	Feature PlanetaryFeature
	Center  geom.Vec3
}

type PlanetaryFeatures interface {
	GetFeaturesAt(node PlanetaryNodeIndex) []PlanetaryFeature
	GetLabeledFeatures() []PlanetaryFeatureLabel
}
