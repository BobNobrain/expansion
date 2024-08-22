package color

import "srv/internal/utils"

type RichColorRGB struct {
	R float64
	G float64
	B float64
}

type RichColor struct {
	Reflective   RichColorRGB
	Transparency float64
	Metalness    float64

	Emissive          RichColorRGB
	EmissionIntensity float64
}

func (c RichColor) GetLightAbsorbtion() float64 {
	colorAlbedo := (c.Reflective.R + c.Reflective.G + c.Reflective.B) / 3
	absorbtion := (1 - colorAlbedo) * c.Transparency

	// let's say metal's specular reflection can bounce off up to 20% of light
	absorbtion *= utils.Lerp(1, 0.8, c.Metalness)

	// can't have 0 or 1 absorbtion
	return utils.Clamp(absorbtion, 0.01, 0.99)
}

func ToRichColorRGB(c Color) RichColorRGB {
	return RichColorRGB{
		R: float64(c.GetR()) / 255,
		G: float64(c.GetG()) / 255,
		B: float64(c.GetB()) / 255,
	}
}
