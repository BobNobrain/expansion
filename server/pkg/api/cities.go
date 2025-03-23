package api

import (
	"time"
)

const (
	CitiesQueryTypeByWorldID = "byWorldId"
)

type CitiesQueryByWorldID struct {
	WorldID string `json:"worldId"`
}

type CitiesTableRow struct {
	CityID       int    `json:"id"`
	WorldID      string `json:"world"`
	CenterTileID int    `json:"center"`

	Name          string    `json:"name"`
	EstablishedAt time.Time `json:"established"`
	EstablishedBy string    `json:"founder"`

	CityBuildings map[string]int `json:"buildings"`
	// UnderConstruction []CityContructionSite `json:"construction"`

	PopulationCounts map[string]LinearEV `json:"popCounts"`

	CityTiles []int `json:"tiles"`
}

type LinearEV struct {
	X float64   `json:"x"`
	T time.Time `json:"t"`
	V float64   `json:"v"`
}
