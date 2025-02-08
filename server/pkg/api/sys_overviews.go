package api

const (
	SysOverviewsQueryTypeBySectorID = "bySectorId"
	SysOverviewsQueryTypeByCoords   = "byCoords"
)

type SysOverviewsQueryBySectorID struct {
	SectorID string `json:"sectorId"`
	Limit    int    `json:"limit"`
}

type SysOverviewsQueryByCoords struct {
	RMin       float64 `json:"rMin"`
	RMax       float64 `json:"rMax"`
	ThetaStart float64 `json:"thStart"`
	ThetaEnd   float64 `json:"thEnd"`
	Limit      int     `json:"limit"`
}

type SysOverviewsTableRow struct {
	SystemID    string  `json:"systemId"`
	CoordsR     float64 `json:"coordsR"`
	CoordsH     float64 `json:"coordsH"`
	CoordsTheta float64 `json:"coordsTh"`
	IsExplored  bool    `json:"isExplored"`
	NPlanets    int     `json:"nPlanets"`
	NMoons      int     `json:"nMoons"`
	NAsteroids  int     `json:"nAsteroids"`
	NPops       int     `json:"nPops"`
	NBases      int     `json:"nBases"`
	NCities     int     `json:"nCities"`

	Stars []SysOverviewsTableRowStar `json:"stars"`
}

type SysOverviewsTableRowStar struct {
	ID             string  `json:"starId"`
	TempK          float64 `json:"tempK"`
	LuminositySuns float64 `json:"lumSuns"`
	RadiusAu       float64 `json:"radiusAu"`
	MassSuns       float64 `json:"massSuns"`
	AgeByrs        float64 `json:"ageByrs"`
}
