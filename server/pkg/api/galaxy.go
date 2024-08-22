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
	Search   string `json:"q"`
	Limit    int    `json:"limit"`
	Offset   int    `json:"offset"`
}

type WorldGetSectorContentResult struct {
	Systems []WorldGetSectorContentResultStarSystem `json:"systems"`

	Total  int `json:"total"`
	Offset int `json:"offset"`
}

type WorldGetSectorContentResultStarSystem struct {
	ID string `json:"systemId"`

	CoordsR     float64 `json:"gR"`
	CoordsTheta float64 `json:"gTheta"`
	CoordsH     float64 `json:"gH"`

	IsExplored bool   `json:"isExplored"`
	ExploredBy string `json:"exploredBy"`
	ExploredAt int64  `json:"exploredAt"`

	NPlanets   int `json:"nPlanets"`
	NAsteroids int `json:"nAsteroids"`

	Stars []WorldGetSectorContentResultStar `json:"stars"`
}

type WorldGetSectorContentResultStar struct {
	ID             string  `json:"starId"`
	TempK          float64 `json:"tempK"`
	LuminositySuns float64 `json:"lumSuns"`
	RadiusAu       float64 `json:"radiusAu"`
	MassSuns       float64 `json:"massSuns"`
	AgeByrs        float64 `json:"ageByrs"`
}

type WorldGetSectorContentResultPlanet struct {
	ID string `json:"planetId"`
}

type WorldGetGalaxyOverviewPayload struct {
	LandmarksLimit int `json:"landmarksLimit"`
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

type WorldGetSystemContentPayload struct {
	SystemID string `json:"systemId"`
}

type WorldGetSystemContentResult struct {
	Stars    []WorldGetSectorContentResultStar    `json:"stars"`
	Orbits   []WorldGetSystemContentResultOrbit   `json:"orbits"`
	Surfaces []WorldGetSystemContentResultSurface `json:"surfaces"`
}

type WorldGetSystemContentResultOrbit struct {
	BodyID       string `json:"bodyId"`
	OrbitsAround string `json:"around"`

	OrbitSemiMajorAxisAu float64 `json:"semiMajorAu"`
	OrbitEccentricity    float64 `json:"ecc"`
	OrbitRotation        float64 `json:"rot"`
	OrbitInclination     float64 `json:"incl"`
	TimeAtPeriapsis      int64   `json:"t0"`
}

type WorldGetSystemContentResultSurface struct {
	SurfaceID  string  `json:"surfaceId"`
	IsExplored bool    `json:"isExplored"`
	MassSuns   float64 `json:"massSuns"`
}

type WorldGetSurfacePayload struct {
	SurfaceID string `json:"surfaceId"`
}

type WorldGetSurfaceResult struct {
	SurfaceID string `json:"surfaceId"`
	Name      string `json:"name"`

	Grid       WorldGetSurfaceResultGrid `json:"grid"`
	Colors     [][]int                   `json:"colors"`
	Elevations []float64
}

type WorldGetSurfaceResultGrid struct {
	Coords []float64 `json:"coords"`
	Edges  [][]int   `json:"edges"`
}
