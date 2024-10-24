package main

import (
	"flag"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"math"
	"os"
	"srv/internal/globals"
	"srv/internal/globals/assets"
	"srv/internal/utils"
	"srv/internal/utils/cmdutils"
	"srv/internal/world"
)

func main() {
	size := flag.Int("size", 1024, "texture size")
	outputPath := flag.String("out", "../ui/assets/tx/galaxy-%d.png", "output path")

	flag.Parse()

	str := fmt.Sprintf(*outputPath, *size)
	outputPath = &str

	globals.Init()

	sleeves := cmdutils.Require(assets.LoadGalaxySleeves())

	GenerateGalaxyTexture(*size, *outputPath, sleeves)
}

func GenerateGalaxyTexture(size int, outputPath string, galaxy *assets.GalaxySleevesAsset) {
	img := image.NewRGBA(image.Rect(0, 0, size, size))
	fSize := float64(size)

	for xPx := 0; xPx < size; xPx++ {
		x := (2*float64(xPx)/fSize - 1) * float64(world.OuterRimRadius)
		for yPx := 0; yPx < size; yPx++ {
			z := (2*float64(yPx)/fSize - 1) * float64(world.OuterRimRadius)

			r := math.Sqrt(x*x + z*z)
			theta := math.Acos(x / r)
			if z < 0 {
				theta = -theta
			}

			brightness := 0.0

			brightness += sampleScatterBrightness(r) * 0.4
			for _, sleeve := range galaxy.Sleeves {
				brightness += sampleSleeveBrightness(r, theta, sleeve) * 7.0
			}
			brightness += sampleCenterBrightness(r)

			if brightness > 1 {
				brightness = 1
			}

			clr := uint8(brightness * 255)

			img.Set(xPx, yPx, color.RGBA{R: clr, G: clr, B: clr, A: 255})
		}
	}

	f := cmdutils.Require(os.Create(outputPath))

	cmdutils.Ensure(png.Encode(f, img))
}

func sampleScatterBrightness(r float64) float64 {
	brightnessFromR := 0.0

	if r < float64(world.InnerRimRadius) {
		brightnessFromR = 1.0
	} else if float64(world.InnerRimRadius) <= r && r <= float64(world.OuterRimRadius) {
		dR := float64(world.OuterRimRadius - world.InnerRimRadius)
		r0 := r - float64(world.InnerRimRadius)
		brightnessFromR = 1.0 - r0*r0/(dR*dR)
	}

	return brightnessFromR
}

func sampleSleeveBrightness(r float64, theta float64, sleeve *assets.GalaxySleeveConfig) float64 {
	rho := (r - float64(world.InnerRimRadius)) / (float64(world.OuterRimRadius) - float64(world.InnerRimRadius))
	if rho < 0.0 || rho >= 1.0 {
		return 0.0
	}

	decr := 2.0 * math.Pi * (rho/sleeve.Twist + sleeve.Pos)
	divisor := (1.0 - rho/2.0) * sleeve.Width * 2 * math.Pi

	muZero := (theta - decr) / divisor
	muPos := (theta + 2.0*math.Pi - decr) / divisor
	muNeg := (theta - 2.0*math.Pi - decr) / divisor

	var mu float64
	if -0.5 < muZero && muZero < 0.5 {
		mu = muZero
	} else if -0.5 < muPos && muPos < 0.5 {
		mu = muPos
	} else if -0.5 < muNeg && muNeg < 0.5 {
		mu = muNeg
	} else {
		return 0.0
	}

	brightnessFromMu := 1.0 - mu*mu*4.0
	brightnessFromR := 1.0 - rho
	if rho < 0.05 {
		brightnessFromR *= rho / 0.05
	}

	return brightnessFromR * brightnessFromMu * sleeve.Density
}

func sampleCenterBrightness(r float64) float64 {
	start := float64(world.InnerRimRadius)
	end := float64(world.InnerRimRadius) * 2.0

	if r < start {
		return 1.0
	}

	if r > end {
		return 0.0
	}

	x := (r - start) / (end - start)
	return utils.NiceExp(1.0 - x)
}
