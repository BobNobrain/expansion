package planetgen

import (
	"fmt"
	"srv/internal/globals/globaldata"
	"srv/internal/utils"
	"srv/internal/world"
)

func (ctx *planetGenContext) generateResorces() {
	ctx.resources = make(map[int][]world.ResourceDeposit)

	resourcesToGenerate := make([]world.ResourceData, 0)
	craftingRegistry := globaldata.Crafting()
	for _, rid := range craftingRegistry.GetAllResourceIDs() {
		res := craftingRegistry.GetResourceData(rid)

		if res.IsFertileOnly && ctx.maxSoilFertility < 0 {
			fmt.Printf("%s is for fertile only, skipping\n", res.ResourceID)
			continue
		}

		coinToss := ctx.rnd.Float64()
		if coinToss < res.Abundance {
			resourcesToGenerate = append(resourcesToGenerate, res)
		} else {
			fmt.Printf("missed a chance on %s: %.2f >= %.2f\n", res.ResourceID, coinToss, res.Abundance)
		}
	}

	n := ctx.grid.Size()

	for _, res := range resourcesToGenerate {
		randomFactor := utils.Lerp(0.05, 0.15, ctx.rnd.Float64())
		nVeins := utils.Clamp(int((float64(n) * res.Veins * randomFactor)), 1, 30)

		fmt.Printf("placing %d veins of %s\n", nVeins, res.ResourceID)

		for range nVeins {
			ctx.placeResourceDeposit(res)
		}
	}
}

func (ctx *planetGenContext) pickRandomTileForResource() int {
	n := ctx.grid.Size()
	candidate1 := ctx.rnd.Intn(n)
	candidate2 := ctx.rnd.Intn(n)
	if candidate1 == candidate2 {
		return candidate1
	}

	// resources should be more likely to generate on solid tiles (aka mountains)
	if ctx.tiles[candidate2].SurfaceType == world.BiomeSurfaceSolid {
		return candidate2
	}

	return candidate1
}

func (ctx *planetGenContext) placeResourceDeposit(res world.ResourceData) {
	ti := ctx.pickRandomTileForResource()

	existingDeposits := ctx.resources[ti]
	for _, dep := range existingDeposits {
		if dep.ResourceID == res.ResourceID {
			return
		}
	}

	deposit := world.ResourceDeposit{
		ResourceID: res.ResourceID,
		Abundance:  utils.Lerp(0.1, 0.95, ctx.rnd.Float64()),
	}

	ctx.resources[ti] = append(existingDeposits, deposit)
}
