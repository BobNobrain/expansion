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
