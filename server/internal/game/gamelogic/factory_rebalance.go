package gamelogic

import (
	"fmt"
	"srv/internal/game"
	"srv/internal/globals/globaldata"
	"srv/internal/utils/common"
	"time"
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

func (l *FactoryRebalanceLogic) ApplyRebalancePlan(
	plan game.FactoryRebalancePlan,
	to game.Factory,
	now time.Time,
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

	newProductionPeriod := to.Production.AlterConfiguration(now, to.Equipment)
	to.Production = newProductionPeriod

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
