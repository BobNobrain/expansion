package game

import (
	"time"
)

type BaseID string

type BaseOverview struct {
	ID            BaseID
	Created       time.Time
	Operator      CompanyID
	WorldID       CelestialID
	TileID        TileID
	DevelopedArea float64
}

type BaseData struct {
	ID       BaseID
	Created  time.Time
	Operator CompanyID
	WorldID  CelestialID
	TileID   TileID

	Equipment []BaseEquipment
}

type BaseEquipment struct {
	EquipmentID   EquipmentID
	Count         int
	ActiveRecipes map[RecipeID]float64
	// TODO: repairs
}
