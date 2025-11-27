package gamelogic

import (
	"fmt"
	"srv/internal/game"
	"srv/internal/globals/globaldata"
	"srv/internal/utils/common"
)

type FactoryValidationLogic struct {
	reg *globaldata.CraftingRegistry
}

func NewFactoryValidationLogic() *FactoryValidationLogic {
	return &FactoryValidationLogic{
		reg: globaldata.Crafting(),
	}
}

func (l *FactoryValidationLogic) MockRegistry(reg *globaldata.CraftingRegistry) {
	l.reg = reg
}

func (l *FactoryValidationLogic) ValidateEquipment(feq game.FactoryEquipment, fieldNameForError string) common.Error {
	if feq.Count <= 0 {
		return common.NewValidationError(
			fieldNameForError+".Count",
			"Equipment count should be a positive integer",
			common.WithDetail("value", feq.Count),
		)
	}

	eqData := l.reg.GetEquipment(feq.EquipmentID)
	if eqData.EquipmentID.IsEmpty() {
		return common.NewValidationError(
			fieldNameForError+".EquipmentID",
			"Specified equipment does not exist",
			common.WithDetail("value", feq.EquipmentID),
			common.WithRetriable(),
		)
	}

	for rid, productionItem := range feq.Production {
		recipeId := productionItem.Template
		recipeData := l.reg.GetRecipe(recipeId)

		if recipeData.Equipment.IsEmpty() {
			return common.NewValidationError(
				fmt.Sprintf("%s.Production[%d].Template", fieldNameForError, rid),
				"Specified recipe does not exist",
				common.WithDetail("value", recipeId),
				common.WithRetriable(),
			)
		}

		if recipeData.Equipment != feq.EquipmentID {
			return common.NewValidationError(
				fmt.Sprintf("%s.Production[%d].Template", fieldNameForError, rid),
				"Mismatching equipment for specified recipe",
				common.WithDetail("value", feq.EquipmentID),
				common.WithDetail("expected", recipeData.Equipment),
				common.WithDetail("recipeID", recipeId),
				common.WithRetriable(),
			)
		}

		if productionItem.ManualEfficiency <= 0.0 || 1.0 < productionItem.ManualEfficiency {
			return common.NewValidationError(
				fmt.Sprintf("%s.Production[%d].ManualEfficiency", fieldNameForError, rid),
				"Manual efficiency should be > 0.0 and <= 1.0",
				common.WithDetail("value", productionItem.ManualEfficiency),
				common.WithRetriable(),
			)
		}

		// TODO: check dynamic outputs
	}

	return nil
}
