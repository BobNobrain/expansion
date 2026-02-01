package gamelogic

import (
	"srv/internal/game"
	"srv/internal/globals/globaldata"
	"srv/internal/globals/logger"
)

type ConstructionLogic struct {
	reg *globaldata.CraftingRegistry
}

var globalConstructionLogic *ConstructionLogic

func Construction() *ConstructionLogic {
	if globalConstructionLogic == nil {
		globalConstructionLogic = &ConstructionLogic{
			reg: globaldata.Crafting(),
		}
	}

	return globalConstructionLogic
}

func (l *ConstructionLogic) GetConstructionCosts(eqId game.EquipmentID, count int) game.InventoryDelta {
	eqData := l.reg.GetEquipment(eqId)
	building := l.reg.GetBaseBuilding(eqData.Building)
	result := game.MakeEmptyInventoryDelta()

	if building.MatsPerArea == nil {
		// TODO: return error?
		logger.Warn(logger.FromMessage("FactoryUpgradeLogic", "unknown building id").WithDetail("building", eqData.Building))
		return game.MakeEmptyInventoryDelta()
	}

	for cid, amount := range building.MatsPerArea {
		result[cid] += amount * eqData.Area * float64(count)
	}

	result.Add(eqData.ConstructionParts, float64(count))
	return result
}
