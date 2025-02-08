package api

const (
	WorldOverviewsQueryTypeBySystemID = "bySystemId"
	// WorldOverviewsQueryTypeByResources = "byResources"
)

type WorldOverviewsQueryBySystemID struct {
	SystemID string `json:"systemId"`
}

type WorldOverviewsTableRow struct {
	WorldID string `json:"worldId"`

	MassEarths float64 `json:"massEarths,omitempty"`
	RadiusKm   float64 `json:"radiusKm,omitempty"`
	AgeByrs    float64 `json:"ageByrs,omitempty"`
	Class      string  `json:"class,omitempty"`

	AxisTiltRads      float64 `json:"axisTiltRads,omitempty"`
	DayLengthGameDays float64 `json:"dayLengthGD,omitempty"`

	Size       int  `json:"size,omitempty"`
	IsExplored bool `json:"isExplored"`

	AvgTempK    float64 `json:"avgTempK"`
	PressureBar float64 `json:"surfacePressureBar"`
	GravityGs   float64 `json:"g"`
}
