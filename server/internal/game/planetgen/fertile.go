package planetgen

import (
	"srv/internal/game"
	"srv/internal/game/fertility"
	"srv/internal/utils"
	"srv/internal/utils/color"
)

// This function checks if the planet has conditions close enough to be fertile
// (i.e. to have life). If so, it adjusts the conditions to be suitable for
// life: clamps temperature and atmospheric pressure into habitable ranges,
// and alters composition of oceans and atmosphere.
func (ctx *planetGenContext) makeFertileIfCloseEnough() {
	const maxAdjustmentTK = 35
	const maxAdjustmentP = 2

	actualTK := ctx.averageTemp.Kelvins()
	possibleTK := utils.MakeSpanAround(actualTK, maxAdjustmentTK)
	actualPBar := ctx.seaLevelPressure.Bar()
	possiblePBar := utils.MakeSpan(actualPBar/maxAdjustmentP, actualPBar*maxAdjustmentP)

	newTemp, newPressure, isPossible := fertility.PickFertileConditions(possibleTK, possiblePBar, ctx.rnd)
	if !isPossible {
		return
	}

	// fmt.Printf(
	// 	"fertile planet accomplished! T: %f->%f, P: %f->%f, atm: %+v, oc: %+v@%f\n",
	// 	ctx.averageTemp.DegreesCelsius(), newTemp.DegreesCelsius(),
	// 	actualPBar, newPressure.Bar(),
	// 	ctx.atmosphere.ToMap(), ctx.oceans.ToMap(), ctx.oceanLevel,
	// )

	// Adjustments list:
	// - bring T and P into habitable range
	ctx.averageTemp = newTemp
	ctx.seaLevelPressure = newPressure

	ctx.maxSoilFertility = fertility.GetFertilityIndex(newTemp, newPressure)
	ctx.maxSoilFertility = utils.MakeSpan(0.1, 1.0).Clamp(ctx.maxSoilFertility)

	// - remove toxic substances
	fertility.CleanUpToxicMaterials(ctx.atmosphere)
	fertility.CleanUpToxicMaterials(ctx.oceans)
	fertility.CleanUpToxicMaterials(ctx.snow)

	// - add (a lot of) H2O into the oceans
	fertility.EnrichOceans(ctx.oceans, ctx.rnd)

	// - add O into the atmosphere
	fertility.EnrichAtmosphere(ctx.atmosphere, ctx.rnd)

	// - increase ocean level if it's too small
	if ctx.oceanLevel < -0.1 {
		ctx.oceanLevel = -0.1
	}
}

// Marks tiles with suitable conditions as fertile (BiomeSurfaceSoil)
func (ctx *planetGenContext) assignFertileBiomes() {
	const MOISTURE_FOR_MAX_FERTILITY = 0.6

	if ctx.maxSoilFertility <= 0.0 {
		return
	}

	moistureLevels := ctx.calculateMoistureLevels()

	for t, tile := range ctx.tiles {
		tile.MoistureLevel = moistureLevels[t]

		switch tile.SurfaceType {
		case game.BiomeSurfaceIce:
		case game.BiomeSurfaceSnow:
		case game.BiomeSurfaceSolid:
			continue
		}

		moistureLevel := moistureLevels[t]
		moistureFertilityModifier := utils.Clamp(utils.Unlerp(0, MOISTURE_FOR_MAX_FERTILITY, moistureLevel), 0, 1)
		tileFertility := fertility.GetFertilityIndex(tile.AverageTemp, tile.Pressure) * moistureFertilityModifier

		tile.SoilFertility = tileFertility
		if tile.SurfaceType != game.BiomeSurfaceLiquid {
			// [0.5, 0.6, 0.3] -> [0.7, 0.6, 0.3]
			tile.Color = color.RichColorRGB{
				R: utils.Lerp(0.7, 0.5, moistureLevel),
				G: 0.6,
				B: 0.3,
			}
		}
	}
}

func (ctx *planetGenContext) calculateMoistureLevels() []float64 {
	const N_ITERATIONS = 10
	const MOISTURE_SPREAD_FACTOR = 0.7

	MOISTURE_BLOCKING_ELEVATION_DIFF := utils.Clamp(2.0/ctx.relativeElevationsScale.Kilometers(), 0.1, 0.8)

	n := ctx.grid.Size()
	moistureLevels := make([]float64, n)
	visited := make(map[int]bool) // it's fine here, no iterations are done on its content
	moistureSpreadFront := utils.NewDeterministicSet[int]()

	for t := range n {
		switch ctx.tiles[t].SurfaceType {
		case game.BiomeSurfaceLiquid:
			moistureLevels[t] = 1.0
			visited[t] = true
			moistureSpreadFront.Add(t)

		case game.BiomeSurfaceIce:
			moistureLevels[t] = 0.5
			visited[t] = true
			moistureSpreadFront.Add(t)
		}
	}

	for range N_ITERATIONS {
		if len(visited) >= n {
			break
		}

		nextFront := utils.NewDeterministicSet[int]()

		for _, t := range moistureSpreadFront.Items() {
			visited[t] = true
			neighbours := ctx.grid.GetConnections(t).Items()
			nNotVisitedNeighbours := 0

			for _, nt := range neighbours {
				if visited[nt] {
					continue
				}

				nNotVisitedNeighbours++
			}

			tElevation := max(ctx.tiles[t].Elevation, 0)
			moistureToSpread := moistureLevels[t] / float64(nNotVisitedNeighbours) * MOISTURE_SPREAD_FACTOR

			for _, nt := range neighbours {
				if visited[nt] {
					continue
				}

				ntElevation := ctx.tiles[nt].Elevation
				elevationDiff := utils.Clamp(ntElevation-tElevation, 0, MOISTURE_BLOCKING_ELEVATION_DIFF)
				elevationRelatedSpreadCoeff := 1 - utils.Unlerp(0, MOISTURE_BLOCKING_ELEVATION_DIFF, elevationDiff)
				moistureLevels[nt] = utils.Clamp(moistureLevels[nt]+moistureToSpread*elevationRelatedSpreadCoeff, 0, 1)

				nextFront.Add(nt)
			}
		}

		moistureSpreadFront = nextFront
	}

	return moistureLevels
}
