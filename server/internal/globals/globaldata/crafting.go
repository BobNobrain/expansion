package globaldata

import (
	"slices"
	"srv/internal/game"
	"srv/internal/globals/assets"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
)

type CraftingRegistry struct {
	commodities        map[game.CommodityID]game.Commodity
	resources          map[game.ResourceID]game.ResourceData
	resourceIDs        []game.ResourceID // this one is needed for consistent iteration order when generating worlds
	materialToResource map[material.MaterialID]game.ResourceID
}

func newCraftingRegistry() *CraftingRegistry {
	return &CraftingRegistry{
		commodities:        make(map[game.CommodityID]game.Commodity),
		resources:          make(map[game.ResourceID]game.ResourceData),
		materialToResource: make(map[material.MaterialID]game.ResourceID),
	}
}

func (r *CraftingRegistry) fill(commoditiesData *assets.CommoditiesAsset) {
	for id, data := range commoditiesData.Commodities {
		r.commodities[game.CommodityID(id)] = game.Commodity{
			CommodityID: game.CommodityID(id),
			Mass:        phys.Kilograms(data.Mass),
			Volume:      phys.CubicMeters(data.Volume),
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
