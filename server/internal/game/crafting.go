package game

import (
	"srv/internal/domain"
	"time"
)

type CommodityID string

func (c CommodityID) IsNil() bool {
	return len(c) == 0
}

// Represents a game commodity (item type that can be produced/bought/stored)
type Commodity struct {
	CommodityID CommodityID
	Size        StorageSize
	IsQuantized bool
}

func (c Commodity) IsNil() bool {
	return len(c.CommodityID) == 0
}

// Represents a singular act of contributing towards some kind of construction project
type ContrubutionHistoryItem struct {
	AmountsProvided InventoryDelta
	Contributor     domain.UserID
	Date            time.Time
}

// Represents a state of gathering resources for some kind of construction project
type Contribution struct {
	AmountsRequired Inventory
	History         []ContrubutionHistoryItem
}

func NewContribution() *Contribution {
	return &Contribution{
		AmountsRequired: MakeEmptyInventory(),
		History:         nil,
	}
}

func (c *Contribution) GetAmountsProvided() Inventory {
	result := MakeEmptyInventory()
	for _, next := range c.History {
		result.Add(next.AmountsProvided)
	}
	return result
}

func (c *Contribution) IsFulfilled() bool {
	return c.GetAmountsProvided().GetDeltaTo(c.AmountsRequired).IsEmpty()
}

func (c *Contribution) Contribute(author domain.UserID, date time.Time, materials InventoryDelta) bool {
	amountsProvided := c.GetAmountsProvided()

	if !amountsProvided.Add(materials) {
		return false
	}

	if !amountsProvided.IsSubsetOf(c.AmountsRequired) {
		return false
	}

	c.History = append(c.History, ContrubutionHistoryItem{
		Contributor:     author,
		Date:            date,
		AmountsProvided: materials,
	})

	return true
}

type BaseBuildingID string

type BaseBuildingData struct {
	BuildingID  BaseBuildingID
	MatsPerArea map[CommodityID]float64
}

type EquipmentID string

func (id EquipmentID) IsEmpty() bool {
	return len(id) == 0
}

type EquipmentData struct {
	EquipmentID EquipmentID
	Area        float64
	Jobs        map[WorkforceType]EquipmentDataJob
	Building    BaseBuildingID
}

type EquipmentDataJob struct {
	Count        int
	Contribution float64
}

type RecipeID int

type RecipeTemplate struct {
	RecipeID      RecipeID
	StaticInputs  map[CommodityID]float64
	StaticOutputs map[CommodityID]float64
	Equipment     EquipmentID
	BaseDuration  time.Duration

	AffectedByFertility  bool
	AffectedByResources  bool
	AffectedBySnow       bool
	AffectedByOcean      bool
	AffectedByAtmosphere bool
}

func (r RecipeTemplate) HasDynamicOutputs() bool {
	return r.AffectedByFertility || r.AffectedByResources || r.AffectedByOcean || r.AffectedByAtmosphere
}

func (r RecipeTemplate) GetProductionItemBase() FactoryProductionItem {
	item := FactoryProductionItem{
		Template: r.RecipeID,
	}
	return item
}
