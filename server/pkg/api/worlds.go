package api

import "time"

const (
	WorldsQueryTypeByID = "byId"
)

type WorldsTableRow struct {
	ID string `json:"worldId"`

	ExploredBy string    `json:"exploredBy,omitempty"`
	ExploredAt time.Time `json:"exploredAt,omitempty"`

	MassEarths float64 `json:"massEarths,omitempty"`
	RadiusKm   float64 `json:"radiusKm,omitempty"`
	AgeByrs    float64 `json:"ageByrs,omitempty"`
	Class      string  `json:"class,omitempty"`

	AxisTiltRads      float64 `json:"axisTiltRads,omitempty"`
	DayLengthGameDays float64 `json:"dayLengthGD,omitempty"`

	GridCoords     []float64   `json:"gridCoords,omitempty"`
	GridEdges      [][]int     `json:"gridEdges,omitempty"`
	Colors         [][]float64 `json:"colors,omitempty"`
	Elevations     []float64   `json:"elevations,omitempty"`
	SurfaceTypes   []string    `json:"surfaceTypes,omitempty"`
	MoistureLevels []float64   `json:"moistureLevels,omitempty"`
	SoilFertility  []float64   `json:"soilFertility,omitempty"`

	ResourceDeposits map[int][]WorldsTableRowResourceDeposit `json:"resources,omitempty"`

	AvgTempK          float64 `json:"avgTempK"`
	PressureBar       float64 `json:"surfacePressureBar"`
	GravityGs         float64 `json:"g"`
	OceansLevel       float64 `json:"oceansLevel"`
	ElevationsScaleKm float64 `json:"elevationsScaleKm"`

	SnowContent       map[string]float64 `json:"snow,omitempty"`
	OceansContent     map[string]float64 `json:"oceans,omitempty"`
	AtmosphereContent map[string]float64 `json:"atmosphere,omitempty"`

	NPops Predictable `json:"nPops"`

	TileCities map[int]int `json:"tileCities"`
	TileBases  map[int]int `json:"tileBases"`
}

type WorldsTableRowResourceDeposit struct {
	ResourceID string  `json:"resource"`
	Abundance  float64 `json:"abundance"`
}
