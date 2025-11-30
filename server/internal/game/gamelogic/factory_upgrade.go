package gamelogic

import (
	"fmt"
	"srv/internal/game"
	"srv/internal/globals/globaldata"
	"srv/internal/utils/common"
	"time"
)

type FactoryUpgradeLogic struct {
	reg *globaldata.CraftingRegistry
}

var globalFactoryUpgradeLogic *FactoryUpgradeLogic

func FactoryUpgrade() *FactoryUpgradeLogic {
	if globalFactoryUpgradeLogic == nil {
		globalFactoryUpgradeLogic = &FactoryUpgradeLogic{
			reg: globaldata.Crafting(),
		}
	}

	return globalFactoryUpgradeLogic
}

func (l *FactoryUpgradeLogic) ValidateUpgradeProject(
	project game.FactoryUpgradeProject,
	craftbook *RecipeLibrary,
	fieldNameForError string,
) common.Error {
	for i, eq := range project.Equipment {
		err := l.validateProduction(eq, craftbook, fmt.Sprintf("%s.Equipment[%d]", fieldNameForError, i))
		if err != nil {
			return err
		}
	}

	return nil
}

func (l *FactoryUpgradeLogic) validateProduction(
	prod game.FactoryUpgradeProjectEqipment,
	craftbook *RecipeLibrary,
	fieldNameForError string,
) common.Error {
	eq := l.reg.GetEquipment(prod.EquipmentID)
	if eq.EquipmentID.IsEmpty() {
		return common.NewValidationError(
			fmt.Sprintf("%s.EquipmentID", fieldNameForError),
			"Invalid equipment ID",
			common.WithDetail("value", prod.EquipmentID),
		)
	}

	if prod.Count <= 0 {
		return common.NewValidationError(
			fmt.Sprintf("%s.Count", fieldNameForError),
			"Invalid equipment count",
			common.WithDetail("value", prod.Count),
		)
	}

	availableRecipes := craftbook.CreateAllRecipesForEquipment(prod.EquipmentID)

	for i, p := range prod.Production {
		_, found := availableRecipes[p.RecipeID]

		if !found {
			return common.NewValidationError(
				fmt.Sprintf("%s.Production[%d].RecipeID", fieldNameForError, i),
				"Invalid recipe ID",
				common.WithDetail("value", p.RecipeID),
			)
		}

		if p.ManualEfficiency <= 0 {
			return common.NewValidationError(
				fmt.Sprintf("%s.Production[%d].ManualEfficiency", fieldNameForError, i),
				"Manual efficiency should be positive",
				common.WithDetail("value", p.ManualEfficiency),
			)
		}
	}

	return nil
}

func (l *FactoryUpgradeLogic) GetConstructionCosts(fup game.FactoryUpgradeProject) *game.Contribution {
	result := game.NewContribution()

	for _, feq := range fup.Equipment {
		eqData := l.reg.GetEquipment(feq.EquipmentID)
		building := l.reg.GetBaseBuilding(eqData.Building)

		if building.MatsPerArea == nil {
			// TODO: return error?
			continue
		}

		for cid, amount := range building.MatsPerArea {
			result.AmountsRequired[cid] += amount * eqData.Area * float64(feq.Count)
		}

		result.AmountsRequired.Add(eqData.ConstructionParts)
	}

	return result
}

func (l *FactoryUpgradeLogic) ContributeToUpgradeProject(
	factory *game.Factory,
	contribution game.ContributionHistoryItem,
	fieldNameForError string,
) (*game.Contribution, common.Error) {
	constructionCosts := l.GetConstructionCosts(factory.Upgrade)
	constructionCosts.History = factory.Upgrade.Progress

	ok := constructionCosts.Contribute(contribution.Contributor, contribution.Date, contribution.AmountsProvided)
	if !ok {
		return nil, common.NewValidationError(
			fieldNameForError,
			"Invalid contribution",
			common.WithDetail("value", contribution),
		)
	}

	factory.Upgrade.Progress = append(factory.Upgrade.Progress, contribution)
	factory.Upgrade.LastUpdated = time.Now()

	return constructionCosts, nil
}

func (l *FactoryUpgradeLogic) ApplyUpgrade(
	factory *game.Factory,
	craftbook *RecipeLibrary,
	now time.Time,
) {
	newEquipment := make([]game.FactoryEquipment, 0, len(factory.Upgrade.Equipment))

	for _, eqProject := range factory.Upgrade.Equipment {
		availableRecipes := craftbook.CreateAllRecipesForEquipment(eqProject.EquipmentID)
		production := make([]game.FactoryProductionItem, 0, len(eqProject.Production))

		for _, prodPlan := range eqProject.Production {
			production = append(production, game.FactoryProductionItem{
				Recipe:           availableRecipes[prodPlan.RecipeID],
				ManualEfficiency: prodPlan.ManualEfficiency,
			})
		}

		newEquipment = append(newEquipment, game.FactoryEquipment{
			EquipmentID: eqProject.EquipmentID,
			Count:       eqProject.Count,
			Production:  production,
		})
	}

	factory.Equipment = newEquipment

	factory.Upgrade.Equipment = nil
	factory.Upgrade.Progress = nil
	factory.Upgrade.LastUpdated = now
}
