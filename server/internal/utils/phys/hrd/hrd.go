package hrd

import (
	"math"
	"math/rand"
	"srv/internal/utils"
	"srv/internal/utils/phys"
)

const (
	probSuperGiants  = 0.01
	probBrightGiants = 0.01
	probGiants       = 0.07
	probSubGiants    = 0.02
	probWhiteDwarfs  = 0.03
)

type HRDiagramPoint struct {
	Mass       phys.Mass
	Luminosity phys.Luminosity
	Temp       phys.Temperature
	Radius     phys.Distance
}

type HRDiagramInput struct {
	Rnd *rand.Rand
	Age phys.Age
}

func point(l float64, t float64) HRDiagramPoint {
	return HRDiagramPoint{
		Luminosity: phys.LuminositySuns(l),
		Temp:       phys.Kelvins(t),
		Mass:       phys.SolarMasses(massFromLum(l)),
		Radius:     phys.AstronomicalUnits(radiusFromLumAndTemp(l, t)),
	}
}

type sampler struct {
	prob float64
	f    func(HRDiagramInput) HRDiagramPoint
}

var samplers = []sampler{
	{
		prob: probSuperGiants,
		f:    sampleSuperGiants,
	},
	{
		prob: probBrightGiants,
		f:    sampleBrightGiants,
	},
	{
		prob: probGiants,
		f:    sampleGiants,
	},
	{
		prob: probSubGiants,
		f:    sampleSubGiants,
	},
	{
		prob: probWhiteDwarfs,
		f:    sampleWhiteDwarfs,
	},
}

func SampleHRDiagram(input HRDiagramInput) HRDiagramPoint {
	r := input.Rnd.Float64()
	var acc float64
	for _, s := range samplers {
		acc += s.prob
		if r < acc {
			return s.f(input)
		}
	}

	return sampleMainSequence(input)
}

// good enough for now, to be enhanced in precision later:

func sampleMainSequence(input HRDiagramInput) HRDiagramPoint {
	posOnLine := input.Rnd.Float64()
	lumPower := utils.Lerp(-4., 4, posOnLine) + input.Rnd.Float64()*0.2
	luminosity := math.Pow(10, lumPower)

	randomTempVariance := utils.Lerp(-1000., 1000, input.Rnd.Float64()*utils.Lerp(0.1, 0.7, posOnLine))

	temp := utils.Lerp(3000., 27_000, utils.NiceExp(posOnLine)) + randomTempVariance

	return point(luminosity, temp)
}

func sampleSuperGiants(input HRDiagramInput) HRDiagramPoint {
	lum := utils.Lerp(5000., 80_000, 1-utils.NiceExp(input.Rnd.Float64()))
	temp := utils.Lerp(3000., 18000, 1-utils.NiceExp(input.Rnd.Float64()))

	return point(lum, temp)
}

func sampleBrightGiants(input HRDiagramInput) HRDiagramPoint {
	lum := utils.Lerp(300., 5000, input.Rnd.Float64())
	temp := utils.Lerp(3000., 17000, input.Rnd.Float64())

	return point(lum, temp)
}

func sampleGiants(input HRDiagramInput) HRDiagramPoint {
	var lum, temp float64
	if input.Rnd.Float64() < 0.75 {
		// right cluster
		lum = utils.Lerp(12., 200, input.Rnd.Float64())
		temp = utils.Lerp(2500., 5500, utils.NiceExp(input.Rnd.Float64()))
	} else {
		// left line
		pos := input.Rnd.Float64()
		lumPower := utils.Lerp(1.5, 3.2, pos)
		lum = math.Pow(10, lumPower)
		temp = utils.Lerp(6000., 12000, utils.NiceExp(pos)) + utils.Lerp(-1000., 500, input.Rnd.Float64())
	}

	return point(lum, temp)
}

func sampleSubGiants(input HRDiagramInput) HRDiagramPoint {
	var lum, temp float64
	if input.Rnd.Float64() < 0.5 {
		// right spot
		lum = utils.Lerp(2., 15, input.Rnd.Float64())
		temp = utils.Lerp(4500., 6100, input.Rnd.Float64())
	} else {
		// left sequence, next to main
		pos := input.Rnd.Float64()
		lumPower := utils.Lerp(0.6, 3, pos) + utils.Lerp(-0.15, 0.15, input.Rnd.Float64())
		lum = math.Pow(10, lumPower)
		temp = utils.Lerp(6000., 12000, utils.NiceExp(pos))
	}

	return point(lum, temp)
}

func sampleWhiteDwarfs(input HRDiagramInput) HRDiagramPoint {
	posOnLine := input.Rnd.Float64()
	lumPower := utils.Lerp(-4.0, -2.1, posOnLine)
	luminosity := math.Pow(10, lumPower)
	temp := utils.Lerp(4000., 13000, utils.NiceExp(posOnLine)) + utils.Lerp(-1500., 1500, input.Rnd.Float64())

	return point(luminosity, temp)
}
