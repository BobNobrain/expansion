package gamelogic

import (
	"srv/internal/game"
	"srv/internal/globals/globaldata"
)

type ConstructionLogic struct {
	reg *globaldata.CraftingRegistry
}

func NewConstructionLogic() *ConstructionLogic {
	return &ConstructionLogic{
		reg: globaldata.Crafting(),
	}
}

func (l *ConstructionLogic) MockRegistry(reg *globaldata.CraftingRegistry) {
	l.reg = reg
}

func (l *ConstructionLogic) CreateFactoryContribution(targets []game.FactoryEquipment) *game.Contribution {
	result := game.NewContribution()

	for _, feq := range targets {
		eqData := l.reg.GetEquipment(feq.EquipmentID)
		building := l.reg.GetBaseBuilding(eqData.Building)

		if building.MatsPerArea == nil {
			// TODO: return error?
			return nil
		}

		for cid, amount := range building.MatsPerArea {
			result.AmountsRequired[cid] += amount * eqData.Area * float64(feq.Count)
		}
	}

	return result
}
