package globaldata

import (
	"fmt"
	"slices"
	"srv/internal/game"
	"srv/internal/globals/assets"
	"srv/internal/globals/logger"
	"srv/internal/utils"
	"srv/internal/utils/phys/material"
	"strings"
)

type CraftingRegistry struct {
	commodities        map[game.CommodityID]game.Commodity
	resources          map[game.ResourceID]game.ResourceData
	resourceIDs        []game.ResourceID // this one is needed for consistent iteration order when generating worlds
	materialToResource map[material.MaterialID]game.ResourceID

	allRecipes     map[game.RecipeTemplateID]game.RecipeTemplate
	dynamicRecipes []game.RecipeTemplate
	equipment      map[game.EquipmentID]game.EquipmentData
	baseBuildings  map[game.BaseBuildingID]game.BaseBuildingData
}

func newCraftingRegistry() *CraftingRegistry {
	return &CraftingRegistry{
		commodities:        make(map[game.CommodityID]game.Commodity),
		resources:          make(map[game.ResourceID]game.ResourceData),
		materialToResource: make(map[material.MaterialID]game.ResourceID),
		allRecipes:         make(map[game.RecipeTemplateID]game.RecipeTemplate),
		equipment:          make(map[game.EquipmentID]game.EquipmentData),
		baseBuildings:      make(map[game.BaseBuildingID]game.BaseBuildingData),
	}
}

func (r *CraftingRegistry) GetCommodity(id game.CommodityID) game.Commodity {
	return r.commodities[id]
}

func (r *CraftingRegistry) GetResourceData(id game.ResourceID) game.ResourceData {
	return r.resources[id]
}
func (r *CraftingRegistry) GetAllResourceIDs() []game.ResourceID {
	return r.resourceIDs
}

func (r *CraftingRegistry) GetResourceForMaterial(id material.MaterialID) game.ResourceData {
	return r.resources[r.materialToResource[id]]
}

func (r *CraftingRegistry) GetEquipment(id game.EquipmentID) game.EquipmentData {
	return r.equipment[id]
}
func (r *CraftingRegistry) GetBaseBuilding(id game.BaseBuildingID) game.BaseBuildingData {
	return r.baseBuildings[id]
}

func (r *CraftingRegistry) GetRecipe(id game.RecipeTemplateID) game.RecipeTemplate {
	return r.allRecipes[id]
}
func (r *CraftingRegistry) GetDynamicRecipes() []game.RecipeTemplate {
	return r.dynamicRecipes
}
func (r *CraftingRegistry) GetRecipesForEquipment(eid game.EquipmentID) []game.RecipeTemplate {
	result := make([]game.RecipeTemplate, 0)

	for _, recipe := range r.allRecipes {
		if recipe.Equipment != eid {
			continue
		}

		result = append(result, recipe)
	}

	return result
}
func (r *CraftingRegistry) CreateAllStaticRecipes() []game.Recipe {
	var result []game.Recipe

	for _, rt := range r.allRecipes {
		if rt.HasDynamicOutputs() {
			continue
		}

		result = append(result, rt.Instantiate())
	}

	return result
}

func (r *CraftingRegistry) FillCommodities(commoditiesData *assets.CommoditiesAsset) {
	for id, data := range commoditiesData.Commodities {
		r.commodities[game.CommodityID(id)] = game.Commodity{
			CommodityID: game.CommodityID(id),
			Size:        game.MakeStorageSize(data.Mass, data.Volume),
			IsQuantized: data.IsQuantized,
		}
	}

	r.resourceIDs = make([]game.ResourceID, 0, len(commoditiesData.Resources))
	for id, data := range commoditiesData.Resources {
		rid := game.ResourceID(id)
		cid := game.CommodityID(id)

		if _, found := r.commodities[cid]; !found {
			panic("crafting data invalid: no commodity for resource " + id)
		}

		r.resources[rid] = game.ResourceData{
			ResourceID:    rid,
			CommodityID:   cid,
			Abundance:     data.Abundance,
			Veins:         data.Veins,
			IsFertileOnly: data.FertileOnly,
		}
		r.resourceIDs = append(r.resourceIDs, rid)
	}
	slices.Sort(r.resourceIDs)

	for matID, resourceID := range commoditiesData.WGMaterialsMap {
		rid := game.ResourceID(resourceID)
		mid := material.MaterialID(matID)

		if Materials().GetByID(mid) == nil {
			panic("crafting data invalid: found material mapping for non-existent material " + matID)
		}

		r.materialToResource[mid] = rid
	}
}

func (r *CraftingRegistry) FillRecipes(recipesData *assets.RecipesAsset) {
	for _, recipeData := range recipesData.Recipes {
		rtid := makeRecipeTemplateId(recipeData)

		inputs := make(map[game.CommodityID]float64)
		outputs := make(map[game.CommodityID]float64)
		baseDuration, err := utils.ParseDurationString(recipeData.BaseTime)
		if err != nil {
			logger.Error(logger.FromUnknownError("globaldata/crafting", err).WithDetail("recipe", recipeData))
			continue
		}

		for cid, amt := range recipeData.Inputs {
			inputs[game.CommodityID(cid)] = amt
		}
		for cid, amt := range recipeData.Outputs {
			outputs[game.CommodityID(cid)] = amt
		}

		rt := game.RecipeTemplate{
			TemplateID:    rtid,
			StaticInputs:  inputs,
			StaticOutputs: outputs,
			Equipment:     game.EquipmentID(recipeData.Equipment),
			BaseDuration:  baseDuration,

			AffectedByFertility:  recipeData.AffectedByFertility,
			AffectedByResources:  recipeData.AffectedByResource,
			AffectedBySnow:       recipeData.AffectedBySnow,
			AffectedByOcean:      recipeData.AffectedByOcean,
			AffectedByAtmosphere: recipeData.AffectedByAtmosphere,
		}

		r.allRecipes[rtid] = rt

		if rt.HasDynamicOutputs() {
			r.dynamicRecipes = append(r.dynamicRecipes, rt)
		}
	}
}

func (r *CraftingRegistry) FillEquipment(equipmentData *assets.EquipmentAsset) {
	for id, buildingData := range equipmentData.Buildings {
		bid := game.BaseBuildingID(id)
		mats := make(map[game.CommodityID]float64)

		for cid, amount := range buildingData.MatsPerArea {
			mats[game.CommodityID(cid)] = amount
		}

		r.baseBuildings[bid] = game.BaseBuildingData{
			BuildingID:  bid,
			MatsPerArea: mats,
		}
	}

	for id, eqData := range equipmentData.Equipment {
		eid := game.EquipmentID(id)
		jobs := make(map[game.WorkforceType]game.EquipmentDataJob)

		for wfType, wfJobs := range eqData.Operators {
			wf := game.ParseWorkforceType(wfType)
			if !wf.IsValid() {
				logger.Error(logger.FromMessage("globaldata/crafting", "unknown workforce type string").WithDetail("value", wfType).WithDetail("eqId", id))
				continue
			}

			jobs[wf] = game.EquipmentDataJob{
				Count:        wfJobs.Count,
				Contribution: wfJobs.Contribution,
			}
		}

		r.equipment[eid] = game.EquipmentData{
			EquipmentID:       eid,
			Area:              float64(eqData.Area),
			Building:          game.BaseBuildingID(eqData.Building),
			Jobs:              jobs,
			ConstructionParts: game.MakeInventoryDeltaFrom(eqData.ConstructionParts),
		}
	}
}

func NewMockCraftingRegistry(
	commoditiesData *assets.CommoditiesAsset,
	equipmentData *assets.EquipmentAsset,
	recipesData *assets.RecipesAsset,
) *CraftingRegistry {
	mock := newCraftingRegistry()
	mock.FillCommodities(commoditiesData)
	mock.FillEquipment(equipmentData)
	mock.FillRecipes(recipesData)
	return mock
}

func makeRecipeTemplateId(rtdata assets.RecipesAssetRecipe) game.RecipeTemplateID {
	sortedInCids := utils.GetMapKeys(rtdata.Inputs)
	slices.Sort(sortedInCids)

	sortedOutCids := utils.GetMapKeys(rtdata.Outputs)
	slices.Sort(sortedOutCids)

	var builder strings.Builder
	if rtdata.AffectedByAtmosphere {
		builder.WriteByte('A')
	}
	if rtdata.AffectedByOcean {
		builder.WriteByte('O')
	}
	if rtdata.AffectedBySnow {
		builder.WriteByte('S')
	}
	if rtdata.AffectedByResource {
		builder.WriteByte('R')
	}
	if rtdata.AffectedByFertility {
		builder.WriteByte('F')
	}

	builder.WriteByte('@')
	builder.WriteString(rtdata.Equipment)

	for _, cid := range sortedInCids {
		fmt.Fprintf(&builder, "%.2f%s", rtdata.Inputs[cid], cid[:min(3, len(cid))])
	}

	builder.WriteString("=")

	for _, cid := range sortedOutCids {
		fmt.Fprintf(&builder, "%.2f%s", rtdata.Outputs[cid], cid[:min(3, len(cid))])
	}

	return game.RecipeTemplateID(builder.String())
}
