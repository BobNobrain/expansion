package game

import (
	"srv/internal/domain"
	"srv/internal/utils/phys"
	"time"
)

type CommodityID string

// Represents a game commodity (item type that can be produced/bought/stored)
type Commodity struct {
	CommodityID CommodityID
	Mass        phys.Mass
	Volume      phys.Volume
	IsQuantized bool
}

func (c Commodity) IsNil() bool {
	return len(c.CommodityID) == 0
}

// Represents a singular act of contributing towards some kind of construction project
type ContrubutionHistoryItem struct {
	AmountsProvided map[CommodityID]float64
	Contributor     domain.UserID
	Date            time.Time
}

// Represents a state of gathering resources for some kind of construction project
type Contrubution struct {
	AmountsRequired map[CommodityID]float64
	AmountsProvided map[CommodityID]float64
	History         []ContrubutionHistoryItem
}

func (c Contrubution) IsFulfilled() bool {
	for cid, required := range c.AmountsRequired {
		provided := c.AmountsProvided[cid]
		if provided < required {
			return false
		}
	}

	return true
}

func (c *Contrubution) Contribute(contribution ContrubutionHistoryItem) bool {
	for cid, amount := range contribution.AmountsProvided {
		required := c.AmountsRequired[cid]
		provided := c.AmountsProvided[cid]

		if provided+amount > required {
			return false
		}
	}

	c.History = append(c.History, contribution)

	for cid, amount := range contribution.AmountsProvided {
		c.AmountsProvided[cid] += amount
	}

	return true
}

type BaseBuildingID string

type BaseBuildingData struct {
	BuildingID  BaseBuildingID
	MatsPerArea map[CommodityID]float64
}

type EquipmentID string

type EquipmentData struct {
	EquipmentID EquipmentID
	Area        float64
	Jobs        map[WorkforceType]int
	Building    BaseBuildingID
}

type Recipe struct {
	Inputs       map[CommodityID]int
	Outputs      map[CommodityID]int
	Equipment    EquipmentID
	BaseDuration time.Duration
}
