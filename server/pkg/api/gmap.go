package api

type DFGalaxyValue struct {
	OuterR float64 `json:"outerR"`
	InnerR float64 `json:"innerR"`
	MaxH   float64 `json:"maxH"`

	Sectors []DFGalaxyValueSector `json:"sectors,omitempty"`
	Labels  []DFGalaxyValueLabel  `json:"labels,omitempty"`

	Landmarks []DFGalaxyValueBeacon     `json:"beacons,omitempty"`
	Waypoints [][]DFGalaxyValueWaypoint `json:"waypoints,omitempty"`
}

type DFGalaxyValueBeacon struct {
	CoordsR        float64 `json:"gR"`
	CoordsTheta    float64 `json:"gTheta"`
	CoordsH        float64 `json:"gH"`
	StarID         string  `json:"starId"`
	TempK          float64 `json:"tempK"`
	LuminositySuns float64 `json:"lumSuns"`
}

type DFGalaxyValueLabel struct {
	CoordsR     float64 `json:"gR"`
	CoordsTheta float64 `json:"gTheta"`
	CoordsH     float64 `json:"gH"`
	Label       string  `json:"label"`
	Type        string  `json:"type"`
}

type DFGalaxyValueSector struct {
	ID         string  `json:"sectorId"`
	OuterR     float64 `json:"outerR"`
	InnerR     float64 `json:"innerR"`
	ThetaStart float64 `json:"thetaStart"`
	ThetaEnd   float64 `json:"thetaEnd"`
}

type DFGalaxyValueWaypoint struct {
	CoordsR     float64 `json:"gR"`
	CoordsTheta float64 `json:"gTheta"`
	CoordsH     float64 `json:"gH"`
	Density     float64 `json:"density"`
}
