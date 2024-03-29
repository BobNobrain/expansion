package api

type WorldPlanetData struct {
	ID   string `json:"id"`
	Name string `json:"name"`

	RadiusKm   float64 `json:"radiusKm"`
	SeaLevelKm float64 `json:"seaLevelKm"`

	Grid  WorldPlanetGrid   `json:"grid"`
	Tiles []WorldPlanetTile `json:"tiles"`
}

type WorldPlanetGrid struct {
	Coords []float64 `json:"coords"`
	Edges  [][]int   `json:"edges"`
}

type WorldPlanetTile struct {
	SolidElevationKm float64 `json:"se"`
	BiomeColor       string  `json:"biomeColor"`
}

type WorldGetSectorContentPayload struct {
	SectorID string `json:"sectorId"`
	Limit    int    `json:"limit"`
}

type WorldGetSectorContentResult struct {
	Stars []WorldGetSectorContentResultStar `json:"stars"`
}

type WorldGetSectorContentResultStar struct {
	ID             string  `json:"starId"`
	TempK          float64 `json:"tempK"`
	LuminositySuns float64 `json:"lumSuns"`
	RadiusAu       float64 `json:"radiusAu"`
	MassSuns       float64 `json:"massSuns"`
	AgeByrs        float64 `json:"ageByrs"`
	CoordsR        float64 `json:"gR"`
	CoordsTheta    float64 `json:"gTheta"`
	CoordsH        float64 `json:"gH"`
}

type WorldGetGalaxyOverviewResult struct {
	Grid      WorldGetGalaxyOverviewResultGrid       `json:"grid"`
	Landmarks []WorldGetGalaxyOverviewResultLandmark `json:"landmarks"`
	Labels    []WorldGetGalaxyOverviewResultLabel    `json:"labels"`
}

type WorldGetGalaxyOverviewResultGrid struct {
	OuterR  float64                                  `json:"outerR"`
	InnerR  float64                                  `json:"innerR"`
	MaxH    float64                                  `json:"maxH"`
	Sectors []WorldGetGalaxyOverviewResultGridSector `json:"sectors"`
}

type WorldGetGalaxyOverviewResultLandmark struct {
	CoordsR        float64 `json:"gR"`
	CoordsTheta    float64 `json:"gTheta"`
	CoordsH        float64 `json:"gH"`
	StarID         string  `json:"starId"`
	TempK          float64 `json:"tempK"`
	LuminositySuns float64 `json:"lumSuns"`
}

type WorldGetGalaxyOverviewResultLabel struct {
	CoordsR     float64 `json:"gR"`
	CoordsTheta float64 `json:"gTheta"`
	CoordsH     float64 `json:"gH"`
	Label       string  `json:"label"`
	Type        string  `json:"type"`
}

type WorldGetGalaxyOverviewResultGridSector struct {
	ID         string  `json:"sectorId"`
	OuterR     float64 `json:"outerR"`
	InnerR     float64 `json:"innerR"`
	ThetaStart float64 `json:"thetaStart"`
	ThetaEnd   float64 `json:"thetaEnd"`
}
