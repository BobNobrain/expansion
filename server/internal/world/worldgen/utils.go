package worldgen

import (
	"srv/internal/utils/phys"
	"srv/internal/world"
)

func dumbIcelineEstimate(
	starTemp phys.Temperature,
	starR phys.Distance,
	targetTemp phys.Temperature,
) phys.Distance {
	// Estimate taken from here:
	// https://physics.stackexchange.com/questions/385161/simplified-formula-for-temperature-between-the-star-and-background-temperature
	// I know it does not account for the fact that during system formation,
	// there is a protoplanetary disk, and stuff is much more complicated that
	// just this, but whatever. Maybe I will revisit this when I will get an
	// astrophysics degree or something.

	// targetTemp = starTemp * sqrt(starR / (2 * (targetDistance - starR)))
	// (targetTemp / starTemp)^2 = starR / (2 * (targetDistance - starR))
	// (starTemp / targetTemp)^2 = 2 * (targetDistance - starR) / starR
	// starR * (starTemp / targetTemp)^2 / 2 + starR = targetDistance
	// starR * (starTemp / targetTemp)^2 / 2 + starR = targetDistance
	tempRel := starTemp.Kelvins() / targetTemp.Kelvins()
	return starR.Mul(tempRel*tempRel/2 + 1)
}

func CombinedStarForEstimates(stars []world.Star) world.StarParams {
	nStars := len(stars)

	if nStars == 1 {
		return stars[0].Params
	}

	combinedCenterStar := stars[0].Params
	if nStars > 1 {
		secondary := stars[1]
		combinedCenterStar.Radius = combinedCenterStar.Radius.Max(secondary.Params.Radius)
		combinedCenterStar.Temperature = max(combinedCenterStar.Temperature, secondary.Params.Temperature)
		combinedCenterStar.Luminosity = max(combinedCenterStar.Luminosity, secondary.Params.Luminosity)
	}

	return combinedCenterStar
}
