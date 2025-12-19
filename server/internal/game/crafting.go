package game

import (
	"fmt"
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
type ContributionHistoryItem struct {
	AmountsProvided InventoryDelta
	Contributor     domain.UserID
	Date            time.Time
}

// Represents a state of gathering resources for some kind of construction project
type Contribution struct {
	AmountsRequired Inventory
	History         []ContributionHistoryItem
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

	c.History = append(c.History, ContributionHistoryItem{
		Contributor:     author,
		Date:            date,
		AmountsProvided: materials,
	})

	return true
}

type BaseBuildingID string

type BaseBuildingData struct {
	BuildingID  BaseBuildingID
	MatsPerArea Inventory
}

type EquipmentID string

func (id EquipmentID) IsEmpty() bool {
	return len(id) == 0
}

type EquipmentData struct {
	EquipmentID       EquipmentID
	Area              float64
	Jobs              map[WorkforceType]EquipmentDataJob
	Building          BaseBuildingID
	ConstructionParts InventoryDelta
}

type EquipmentDataJob struct {
	Count        int
	Contribution float64
}

type RecipeTemplateID string

type RecipeTemplate struct {
	TemplateID    RecipeTemplateID
	StaticInputs  InventoryDelta
	StaticOutputs InventoryDelta
	Equipment     EquipmentID
	BaseDuration  time.Duration

	AffectedByFertility  bool
	AffectedByResources  bool
	AffectedBySnow       bool
	AffectedByOcean      bool
	AffectedByAtmosphere bool
}

func (t RecipeTemplate) IsValid() bool {
	return !t.Equipment.IsEmpty()
}
func (t RecipeTemplate) HasDynamicOutputs() bool {
	return t.AffectedByFertility || t.AffectedByResources || t.AffectedByOcean || t.AffectedByAtmosphere
}

func (t RecipeTemplate) Instantiate() Recipe {
	result := Recipe{
		RecipeID:    RecipeID(t.TemplateID),
		TemplateID:  t.TemplateID,
		EquipmentID: t.Equipment,
		Inputs:      MakeEmptyInventoryDelta(),
		Outputs:     MakeEmptyInventoryDelta(),
	}

	timeScale := t.GetDurationScale()

	for cid, amt := range t.StaticInputs {
		result.Inputs[cid] += amt * timeScale
	}
	for cid, amt := range t.StaticOutputs {
		result.Outputs[cid] += amt * timeScale
	}

	return result
}
func (t RecipeTemplate) GetDurationScale() float64 {
	return 1.0 / t.BaseDuration.Hours()
}

func (t RecipeTemplate) InstantiateWithScaledOutputs(scale float64) Recipe {
	r := t.Instantiate()
	r.RecipeID += RecipeID(fmt.Sprintf("*%.3f", scale))
	for cid := range r.Outputs {
		r.Outputs[cid] *= scale
	}
	return r
}

func (t RecipeTemplate) InstantiateWithDynamicOutput(cid CommodityID, amt float64) Recipe {
	r := t.Instantiate()
	r.RecipeID += RecipeID(fmt.Sprintf("+%s", cid))
	r.Outputs[cid] += amt * t.GetDurationScale()
	return r
}

type RecipeID string

type Recipe struct {
	RecipeID    RecipeID
	TemplateID  RecipeTemplateID
	Inputs      InventoryDelta
	Outputs     InventoryDelta
	EquipmentID EquipmentID
}
