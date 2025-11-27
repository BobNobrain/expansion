package gamelogic

import (
	"srv/internal/game"
	"srv/internal/globals/globaldata"
)

type BaseLogicImpl struct {
	reg *globaldata.CraftingRegistry
}

var globalBaseLogic *BaseLogicImpl

func BaseLogic() *BaseLogicImpl {
	if globalBaseLogic == nil {
		globalBaseLogic = &BaseLogicImpl{
			reg: globaldata.Crafting(),
		}
	}

	return globalBaseLogic
}
func BaseLogicMocked(reg *globaldata.CraftingRegistry) *BaseLogicImpl {
	return &BaseLogicImpl{
		reg: reg,
	}
}

func (l *BaseLogicImpl) GetBaseStorageLimits() game.StorageSize {
	// TODO: consider base configuration
	return game.MakeStorageSize(5000, 5000)
}
