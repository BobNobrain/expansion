package api

import "time"

const (
	TilesQueryTypeByWorldID = "byWorldId"
	TilesQueryTypeByTileID  = "byTileId"
)

type TilesQueryByWorldID struct {
	WorldID string `json:"worldId"`
}

type TilesQueryByTileID struct {
	WorldID string `json:"worldId"`
	TileID  int    `json:"tileId"`
}

type TilesTableRow struct {
	City  *TilesTableRowCity  `json:"city,omitempty"`
	Base  *TilesTableRowBase  `json:"base,omitempty"`
	Infra *TilesTableRowInfra `json:"infra,omitempty"`
}

type TilesTableRowCity struct {
	CityID     int       `json:"id"`
	Name       string    `json:"name"`
	Population int       `json:"population"`
	Level      int       `json:"level"`
	FoundedAt  time.Time `json:"foundedAt"`
	FoundedBy  string    `json:"foundedBy"`
}

type TilesTableRowBase struct {
	BaseID      int       `json:"id"`
	OwnerID     string    `json:"owner"`
	Operator    string    `json:"operator"`
	FoundedAt   time.Time `json:"foundedAt"`
	Development float64   `json:"development"`
}

type TilesTableRowInfra struct {
	InfraID int `json:"id"`
}
