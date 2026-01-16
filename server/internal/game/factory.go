package game

import (
	"fmt"
	"strconv"
	"time"
)

type FactoryID int

func (f FactoryID) String() string {
	return strconv.Itoa(int(f))
}

type FactoryStaticOverview struct {
	FactoryID FactoryID
	BaseID    BaseID
	WorldID   CelestialID
	TileID    TileID
	BuiltAt   time.Time
	Name      string
}

type Factory struct {
	FactoryID FactoryID
	BaseID    BaseID
	BuiltAt   time.Time
	Name      string

	Equipment []FactoryEquipment
	Employees map[WorkforceType]int

	Production FactoryProductionPeriod

	Upgrade FactoryUpgradeProject
}

func (f *Factory) AsStorage() Storage {
	return f
}

func (f *Factory) GetStorageID() StorageID {
	return MakeFactoryStorageID(f.FactoryID)
}

func (f *Factory) GetName() string {
	// TBD: factory names
	return fmt.Sprintf("Factory %d", f.FactoryID)
}

func (f *Factory) GetInventoryRef() Inventory {
	return f.Production.inventory
}

func (f *Factory) GetDynamicInventoryCopy() DynamicInventory {
	return f.Production.GetDynamicInventory()
}

func (f *Factory) GetSizeLimit() StorageSize {
	return MakeInfiniteStorageSize()
}

func MakeEmptyFactory() Factory {
	now := time.Now()

	return Factory{
		BuiltAt: now,

		Equipment: make([]FactoryEquipment, 0),
		Employees: make(map[WorkforceType]int),

		Production: MakeEmptyFactoryProductionPeriod(now),

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
