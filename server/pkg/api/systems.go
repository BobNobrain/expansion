package api

import "time"

const (
	SystemsQueryTypeByID = "byId"
)

type SystemsQueryByID struct {
	SystemID string `json:"systemId"`
}

type SystemsTableRow struct {
	ID string `json:"systemId"`

	ExploredBy string    `json:"exploredBy"`
	ExploredAt time.Time `json:"exploredAt"`

	Stars  map[string]SysOverviewsTableRowStar `json:"stars,omitempty"`
	Orbits map[string]SystemsTableRowOrbit     `json:"orbits,omitempty"`
}

type SystemsTableRowOrbit struct {
	OrbitsAround string `json:"around"`

	OrbitSemiMajorAxisAu float64   `json:"semiMajorAu"`
	OrbitEccentricity    float64   `json:"ecc"`
	OrbitRotation        float64   `json:"rot"`
	OrbitInclination     float64   `json:"incl"`
	TimeAtPeriapsis      time.Time `json:"t0"`
}
