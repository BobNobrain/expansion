package main

import (
	"fmt"
	"image"
	"image/color"
	"image/png"
	"math"
	"math/rand"
	"os"
	"srv/internal/utils/cmdutils"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/hrd"
)

func main() {
	drawDiagram(512, "./hrd.png")
}

func drawDiagram(size int, outputPath string) {
	img := image.NewRGBA(image.Rect(0, 0, size, size))
	halfSize := size / 2

	for xPx := 0; xPx < size; xPx++ {
		for yPx := 0; yPx < size; yPx++ {
			img.Set(xPx, yPx, color.RGBA{R: 0, G: 0, B: 0, A: 255})
		}
	}

	// stars := cmdutils.Require(store.CelestialRepo().LoadAll())
	rnd := rand.New(rand.NewSource(42))
	nOffscreen := 0

	for i := 0; i < 10_000; i++ {
		point := hrd.SampleHRDiagram(hrd.HRDiagramInput{
			Rnd: rnd,
			Age: phys.BillionYears(0.1),
		})

		xPx := tempToPixels(point.Temp.Kelvins(), size)
		yPx := lumToPixels(point.Luminosity.Suns(), size)

		if xPx < 0 || xPx >= size || yPx < 0 || yPx >= size {
			nOffscreen++
			continue
		}

		clr := point.Temp.GetHeatColor()

		img.Set(xPx, yPx, color.RGBA{R: clr.GetR(), G: clr.GetG(), B: clr.GetB(), A: 255})
	}

	img.Set(halfSize, halfSize, color.RGBA{R: 0, G: 255, B: 0, A: 255})
	img.Set(halfSize-1, halfSize, color.RGBA{R: 0, G: 255, B: 0, A: 255})
	img.Set(halfSize+1, halfSize, color.RGBA{R: 0, G: 255, B: 0, A: 255})
	img.Set(halfSize, halfSize-1, color.RGBA{R: 0, G: 255, B: 0, A: 255})
	img.Set(halfSize, halfSize+1, color.RGBA{R: 0, G: 255, B: 0, A: 255})

	temps := []float64{3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 20000, 30000}
	for _, k := range temps {
		x := tempToPixels(k, size)
		img.Set(x, 0, color.RGBA{R: 0, G: 255, B: 0, A: 255})
		img.Set(x, 1, color.RGBA{R: 0, G: 255, B: 0, A: 255})
	}

	lums := []float64{-4, -3, -2, -1, 0, 1, 2, 3, 4}
	for _, pow := range lums {
		y := lumToPixels(math.Pow(10, pow), size)
		img.Set(0, y, color.RGBA{R: 0, G: 255, B: 0, A: 255})
		img.Set(1, y, color.RGBA{R: 0, G: 255, B: 0, A: 255})
	}

	f := cmdutils.Require(os.Create(outputPath))
	cmdutils.Ensure(png.Encode(f, img))

	fmt.Printf("offscreen points: %d\n", nOffscreen)
}

func tempToPixels(kelvins float64, size int) int {
	xNormalized := 1 - logarithmic(kelvins, 2000, 31_000)
	xPx := int(xNormalized * float64(size))
	return xPx
}
func lumToPixels(lumSuns float64, size int) int {
	log := math.Log10(lumSuns)
	yNormalized := 1 - (log+5)/10
	yPx := int(yNormalized * float64(size))
	return yPx
}

func logarithmic(input, min, max float64) float64 {
	unlerped := (input - min) / (max - min)
	return math.Log(unlerped+1) / math.Ln2
}
