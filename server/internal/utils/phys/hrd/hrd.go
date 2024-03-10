package hrd

import (
	"math"
	"math/rand"
	"srv/internal/utils"
	"srv/internal/utils/phys"
)

const (
	probMainSequence = 0.9
	probSuperGiants  = 0.005
	probBrightGiants = 0.005
	probGiants       = 0.07
	probSubGiants    = 0.01
	probWhiteDwarfs  = 0.01
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
		prob: probMainSequence,
		f:    sampleMainSequence,
	},
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
		if acc < r {
			return s.f(input)
		}
	}

	return sampleMainSequence(input)
}

// good enough for now, to be enhanced in precision later:

func sampleMainSequence(input HRDiagramInput) HRDiagramPoint {
	posOnLine := input.Rnd.Float64()
	lumPower := utils.Lerp(-4., 7, posOnLine) + input.Rnd.Float64()*0.3
	luminosity := math.Pow(10, lumPower)
	temp := utils.Lerp(2500., 30_000, posOnLine)

	return point(luminosity, temp)
}

func sampleSuperGiants(input HRDiagramInput) HRDiagramPoint {
	lum := utils.Lerp(5000., 80_000, input.Rnd.Float64())
	temp := utils.Lerp(3000., 15000, input.Rnd.Float64())

	return point(lum, temp)
}

func sampleBrightGiants(input HRDiagramInput) HRDiagramPoint {
	lum := utils.Lerp(300., 3000, input.Rnd.Float64())
	temp := utils.Lerp(3000., 15000, input.Rnd.Float64())

	return point(lum, temp)
}

func sampleGiants(input HRDiagramInput) HRDiagramPoint {
	var lum, temp float64
	if input.Rnd.Float64() < 0.75 {
		// left cluster
		lum = utils.Lerp(12., 200, input.Rnd.Float64())
		temp = utils.Lerp(2500., 5400, input.Rnd.Float64())
	} else {
		// right sparse line
		pos := input.Rnd.Float64()
		lumPower := utils.Lerp(1.5, 3.2, pos)
		lum = math.Pow(10, lumPower)
		temp = utils.Lerp(12., 2000, pos) + utils.Lerp(-1000., 500, input.Rnd.Float64())
	}

	return point(lum, temp)
}

func sampleSubGiants(input HRDiagramInput) HRDiagramPoint {
	var lum, temp float64
	if input.Rnd.Float64() < 0.3 {
		// left spot
		lum = utils.Lerp(2., 10, input.Rnd.Float64())
		temp = utils.Lerp(4500., 6100, input.Rnd.Float64())
	} else {
		// right sequence, next to main
		pos := input.Rnd.Float64()
		lumPower := utils.Lerp(0.6, 3, pos) + utils.Lerp(-0.15, 0.15, input.Rnd.Float64())
		lum = math.Pow(10, lumPower)
		temp = utils.Lerp(12., 2000, pos)
	}

	return point(lum, temp)
}

func sampleWhiteDwarfs(input HRDiagramInput) HRDiagramPoint {
	posOnLine := input.Rnd.Float64()
	lumPower := utils.Lerp(-4.0, -2.1, posOnLine)
	luminosity := math.Pow(10, lumPower)
	temp := utils.Lerp(4000., 12000, posOnLine) + utils.Lerp(-3000., 3000, input.Rnd.Float64())

	return point(luminosity, temp)
}
