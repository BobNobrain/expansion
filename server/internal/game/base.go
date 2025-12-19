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

	Inventory Inventory
}

type FactoryID int

func (f FactoryID) String() string {
	return strconv.Itoa(int(f))
}

type FactoryProductionStatus byte

const (
	// The factory has been manually disabled and should not be automatically turned back on
	FactoryProductionStatusDisabled FactoryProductionStatus = iota
	// The factory is running, producing outputs and consuming inputs
	FactoryProductionStatusActive
	// The factory is being prevented from functioning properly (due to lack of inputs, storage, etc). Should the issues
	// be resolved, it will become active again.
	FactoryProductionStatusHalted
)

// Returns true for any factory status that permits factory operation (i.e. its production running)
func (s FactoryProductionStatus) IsActive() bool {
	return s == FactoryProductionStatusActive
}

func (s FactoryProductionStatus) String() string {
	switch s {
	case FactoryProductionStatusDisabled:
		return "disabled"
	case FactoryProductionStatusActive:
		return "active"
	case FactoryProductionStatusHalted:
		return "halted"
	default:
		return ""
	}
}
func ParseFactoryStatus(s string) FactoryProductionStatus {
	switch s {
	case "disabled":
		return FactoryProductionStatusDisabled
	case "active":
		return FactoryProductionStatusActive
	case "halted":
		return FactoryProductionStatusHalted
	default:
		return FactoryProductionStatusDisabled
	}
}

type FactoryStaticOverview struct {
	FactoryID FactoryID
	BaseID    BaseID
	WorldID   CelestialID
	TileID    TileID
	BuiltAt   time.Time
}

type FactoryProductionSnapshot struct {
	Date            time.Time
	Status          FactoryProductionStatus
	StaticInventory Inventory
	ProductionLines [][]FactoryProductionItem
}

type Factory struct {
	FactoryID FactoryID
	BaseID    BaseID
	Status    FactoryProductionStatus
	Equipment []FactoryEquipment
	Employees map[WorkforceType]int
	UpdatedTo time.Time
	BuiltAt   time.Time

	StaticInventory  Inventory
	DynamicInventory DynamicInventory

	Upgrade FactoryUpgradeProject
}

func MakeEmptyFactory() Factory {
	now := time.Now()

	return Factory{
		Status:          FactoryProductionStatusActive,
		Equipment:       nil,
		StaticInventory: MakeEmptyInventory(),
		Employees:       make(map[WorkforceType]int),
		UpdatedTo:       now,
		BuiltAt:         now,
		Upgrade: FactoryUpgradeProject{
			Equipment:   nil,
			Progress:    nil,
			LastUpdated: now,
		},
	}
}

type FactoryEquipment struct {
	EquipmentID EquipmentID
	Count       int
	Production  []FactoryProductionItem
}

type FactoryProductionItem struct {
	Recipe           Recipe
	ManualEfficiency float64
}

type FactoryUpgradeProject struct {
	Equipment   []FactoryUpgradeProjectEqipment
	Progress    []ContributionHistoryItem
	LastUpdated time.Time
}

type FactoryUpgradeProjectEqipment struct {
	EquipmentID EquipmentID
	Count       int
	Production  []FactoryProductionPlan
}

func (fup FactoryUpgradeProject) IsEmpty() bool {
	return len(fup.Equipment) == 0
}
func (fup FactoryUpgradeProject) IsPlanned() bool {
	return !fup.IsEmpty() && !fup.IsInProgress()
}
func (fup FactoryUpgradeProject) IsInProgress() bool {
	return len(fup.Progress) > 0
}

type FactoryRebalancePlan struct {
	EquipmentRebalances []FactoryEquipmentRebalancePlan
}

type FactoryEquipmentRebalancePlan struct {
	Production []FactoryProductionPlan
}

type FactoryProductionPlan struct {
	RecipeID         RecipeID
	ManualEfficiency float64
}
