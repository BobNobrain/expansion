package fertility

import (
	"math"
	"math/rand"
	"srv/internal/globals/globaldata"
	"srv/internal/utils"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
)

var (
	acceptableTK = utils.MakeSpan(
		phys.DegreesCelsius(0).Kelvins(),
		phys.DegreesCelsius(30).Kelvins(),
	)
	acceptablePBar = utils.MakeSpan(0.5, 2.0)
)

func PickFertileConditions(possibleTK, possiblePBar utils.Span, rnd *rand.Rand) (phys.Temperature, phys.Pressure, bool) {
	if !possiblePBar.OverlapsWith(acceptablePBar) || !possibleTK.OverlapsWith(acceptableTK) {
		// conditions are too harsh
		return phys.Kelvins(0), phys.Bar(0), false
	}

	newTemp := phys.Kelvins(
		possibleTK.Intersect(acceptableTK).SampleAt(rnd.Float64()),
	)
	newPressure := phys.Bar(
		possiblePBar.Intersect(acceptablePBar).SampleAt(rnd.Float64()),
	)
	return newTemp, newPressure, true
}

func GetFertilityIndex(t phys.Temperature, p phys.Pressure) float64 {
	result := 1.0
	result *= 1.0 - utils.MakeSpan(0.0, 1.0).Clamp(2.0*math.Abs(acceptableTK.RelativePos(t.Kelvins())-0.5))
	result *= 1.0 - utils.MakeSpan(0.0, 1.0).Clamp(2.0*math.Abs(acceptablePBar.RelativePos(p.Bar())-0.5))
	return result
}

func EnrichAtmosphere(atmosphere *material.MaterialCompound, rnd *rand.Rand) {
	amountOxygen := utils.Lerp(0.15, 0.35, rnd.Float64())
	amountNitrogen := utils.Lerp(0.30, 0.80, rnd.Float64())
	if amountNitrogen+amountOxygen >= 1.0 {
		amountNitrogen = 0.99 - amountOxygen
	}

	percentages := make(map[*material.Material]float64, 2)
	percentages[globaldata.Materials().GetByID("o2")] = amountOxygen
	percentages[globaldata.Materials().GetByID("n2")] = amountNitrogen

	atmosphere.SetPercentages(percentages)
}

func EnrichOceans(oceans *material.MaterialCompound, rnd *rand.Rand) {
	amountWater := utils.Lerp(0.95, 0.99, rnd.Float64())

	percentages := make(map[*material.Material]float64, 1)
	percentages[globaldata.Materials().GetByID("h2o")] = amountWater

	oceans.SetPercentages(percentages)
}

func CleanUpToxicMaterials(compound *material.MaterialCompound) {
	for _, mat := range compound.ListMaterials() {
		if mat.HasAnyTag("toxic") {
			compound.Remove(mat)
		}
	}
}
