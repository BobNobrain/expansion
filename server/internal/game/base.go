package game

import (
	"strconv"
	"time"
)

type BaseID int

func (bid BaseID) String() string {
	return strconv.Itoa(int(bid))
}

type BaseOverview struct {
	ID            BaseID
	Created       time.Time
	Operator      CompanyID
	WorldID       CelestialID
	TileID        TileID
	DevelopedArea float64
	NFactories    int
}

type Base struct {
	ID       BaseID
	Created  time.Time
	Operator CompanyID
	WorldID  CelestialID
	TileID   TileID
	CityID   CityID

	// Factories []BaseFactory
	Sites []BaseConstructionSite
}

type FactoryID int

func (f FactoryID) String() string {
	return strconv.Itoa(int(f))
}

type FactoryStatus byte

const (
	// The factory has been manually disabled and should not be automatically turned back on
	FactoryStatusDisabled FactoryStatus = iota
	// The factory is running, producing outputs and consuming inputs
	FactoryStatusActive
	// The factory is being prevented from functioning properly (due to lack of inputs, storage, etc). Should the issues
	// be resolved, it will become active again.
	FactoryStatusHalted
)

// Returns true for any factory status that permits factory operation (i.e. its production running)
func (s FactoryStatus) IsActive() bool {
	return s == FactoryStatusActive
}

func (s FactoryStatus) String() string {
	switch s {
	case FactoryStatusDisabled:
		return "disabled"
	case FactoryStatusActive:
		return "active"
	case FactoryStatusHalted:
		return "halted"
	default:
		return ""
	}
}
func ParseFactoryStatus(s string) FactoryStatus {
	switch s {
	case "disabled":
		return FactoryStatusDisabled
	case "active":
		return FactoryStatusActive
	case "halted":
		return FactoryStatusHalted
	default:
		return FactoryStatusDisabled
	}
}

type Factory struct {
	FactoryID FactoryID
	BaseID    BaseID
	Status    FactoryStatus
	Equipment []FactoryEquipment
	Inventory Inventory
	Employees map[WorkforceType]int
	Updated   time.Time
	BuiltAt   time.Time
}

type FactoryEquipment struct {
	EquipmentID EquipmentID
	Count       int
	Production  map[RecipeID]FactoryProductionItem
}

type FactoryProductionItem struct {
	Template         RecipeID
	DynamicOutputs   Inventory
	ManualEfficiency float64
}

type BaseConstructionSite struct {
	Target      []FactoryEquipment
	Contributed *Contrubution
}
