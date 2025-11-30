package gamelogic

import (
	"fmt"
	"srv/internal/game"
	"srv/internal/globals/globaldata"
	"srv/internal/utils/common"
)

type FactoryRebalanceLogic struct {
	reg *globaldata.CraftingRegistry
}

var globalFactoryRebalanceLogic *FactoryRebalanceLogic

func FactoryRebalance() *FactoryRebalanceLogic {
	if globalFactoryRebalanceLogic == nil {
		globalFactoryRebalanceLogic = &FactoryRebalanceLogic{
			reg: globaldata.Crafting(),
		}
	}

	return globalFactoryRebalanceLogic
}

// func (l *FactoryRebalanceLogic) ValidateEquipment(feq game.FactoryEquipment, fieldNameForError string) common.Error {
// 	if feq.Count <= 0 {
// 		return common.NewValidationError(
// 			fieldNameForError+".Count",
// 			"Equipment count should be a positive integer",
// 			common.WithDetail("value", feq.Count),
// 		)
// 	}

// 	eqData := l.reg.GetEquipment(feq.EquipmentID)
// 	if eqData.EquipmentID.IsEmpty() {
// 		return common.NewValidationError(
// 			fieldNameForError+".EquipmentID",
// 			"Specified equipment does not exist",
// 			common.WithDetail("value", feq.EquipmentID),
// 			common.WithRetriable(),
// 		)
// 	}

// 	for rid, productionItem := range feq.Production {
// 		recipeTemplateId := productionItem.Recipe.TemplateID
// 		recipeTemplateData := l.reg.GetRecipe(recipeTemplateId)

// 		if !recipeTemplateData.IsValid() {
// 			return common.NewValidationError(
// 				fmt.Sprintf("%s.Production[%d].Template", fieldNameForError, rid),
// 				"Specified recipe does not exist",
// 				common.WithDetail("value", recipeTemplateId),
// 				common.WithRetriable(),
// 			)
// 		}

// 		if recipeTemplateData.Equipment != feq.EquipmentID {
// 			return common.NewValidationError(
// 				fmt.Sprintf("%s.Production[%d].Template", fieldNameForError, rid),
// 				"Mismatching equipment for specified recipe",
// 				common.WithDetail("value", feq.EquipmentID),
// 				common.WithDetail("expected", recipeTemplateData.Equipment),
// 				common.WithDetail("recipeID", recipeTemplateId),
// 				common.WithRetriable(),
// 			)
// 		}

// 		if productionItem.ManualEfficiency <= 0.0 || 1.0 < productionItem.ManualEfficiency {
// 			return common.NewValidationError(
// 				fmt.Sprintf("%s.Production[%d].ManualEfficiency", fieldNameForError, rid),
// 				"Manual efficiency should be > 0.0 and <= 1.0",
// 				common.WithDetail("value", productionItem.ManualEfficiency),
// 				common.WithRetriable(),
// 			)
// 		}
// 	}

// 	return nil
// }

func (l *FactoryRebalanceLogic) ApplyRebalancePlan(
	plan game.FactoryRebalancePlan,
	to game.Factory,
	craftbook *RecipeLibrary,
	fieldNameForError string,
) (game.Factory, common.Error) {
	for i, rebalancePlan := range plan.EquipmentRebalances {
		originalEq := to.Equipment[i]

		newProduction, err := l.CreateRebalancedProduction(
			originalEq,
			craftbook.CreateAllRecipesForEquipment(originalEq.EquipmentID),
			rebalancePlan,
			fmt.Sprintf("%s.EquipmentRebalances[%d]", fieldNameForError, i),
		)

		if err != nil {
			return to, err
		}

		to.Equipment[i].Production = newProduction
	}

	return to, nil
}

func (l *FactoryRebalanceLogic) CreateRebalancedProduction(
	source game.FactoryEquipment,
	availableRecipes map[game.RecipeID]game.Recipe,
	rebalancePlan game.FactoryEquipmentRebalancePlan,
	fieldNameForError string,
) ([]game.FactoryProductionItem, common.Error) {
	newProduction := make([]game.FactoryProductionItem, 0, len(rebalancePlan.Production))

	for i, prodParams := range rebalancePlan.Production {
		recipe, found := availableRecipes[prodParams.RecipeID]

		if !found {
			return nil, common.NewValidationError(
				fmt.Sprintf("%s.Production[%d].RecipeID", fieldNameForError, i),
				"Invalid recipe ID",
				common.WithDetail("value", prodParams.RecipeID),
			)
		}

		newProduction = append(newProduction, game.FactoryProductionItem{
			Recipe:           recipe,
			ManualEfficiency: prodParams.ManualEfficiency,
		})
	}

	return newProduction, nil
}
