package globaldata

import (
	"slices"
	"srv/internal/globals/assets"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
	"srv/internal/world"
	"srv/internal/world/crafting"
)

type CraftingRegistry struct {
	commodities        map[crafting.CommodityID]crafting.Commodity
	resources          map[world.ResourceID]world.ResourceData
	resourceIDs        []world.ResourceID // this one is needed for consistent iteration order when generating worlds
	materialToResource map[material.MaterialID]world.ResourceID
}

func newCraftingRegistry() *CraftingRegistry {
	return &CraftingRegistry{
		commodities:        make(map[crafting.CommodityID]crafting.Commodity),
		resources:          make(map[world.ResourceID]world.ResourceData),
		materialToResource: make(map[material.MaterialID]world.ResourceID),
	}
}

func (r *CraftingRegistry) fill(commoditiesData *assets.CommoditiesAsset) {
	for id, data := range commoditiesData.Commodities {
		r.commodities[crafting.CommodityID(id)] = crafting.Commodity{
			CommodityID: crafting.CommodityID(id),
			Mass:        phys.Kilograms(data.Mass),
			Volume:      phys.CubicMeters(data.Volume),
			IsQuantized: data.IsQuantized,
		}
	}

	r.resourceIDs = make([]world.ResourceID, 0, len(commoditiesData.Resources))
	for id, data := range commoditiesData.Resources {
		rid := world.ResourceID(id)
		cid := crafting.CommodityID(id)

		if _, found := r.commodities[cid]; !found {
			panic("crafting data invalid: no commodity for resource " + id)
		}

		r.resources[rid] = world.ResourceData{
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
		rid := world.ResourceID(resourceID)
		mid := material.MaterialID(matID)

		if Materials().GetByID(mid) == nil {
			panic("crafting data invalid: found material mapping for non-existent material " + matID)
		}

		r.materialToResource[mid] = rid
	}
}

func (r *CraftingRegistry) GetCommodity(id crafting.CommodityID) crafting.Commodity {
	return r.commodities[id]
}

func (r *CraftingRegistry) GetResourceData(id world.ResourceID) world.ResourceData {
	return r.resources[id]
}
func (r *CraftingRegistry) GetAllResourceIDs() []world.ResourceID {
	return r.resourceIDs
}

func (r *CraftingRegistry) GetResourceForMaterial(id material.MaterialID) world.ResourceData {
	return r.resources[r.materialToResource[id]]
}
