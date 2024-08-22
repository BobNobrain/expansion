package assets

import (
	"srv/internal/utils/color"
	"srv/internal/utils/phys"
	"srv/internal/utils/phys/material"
)

type WGMaterialColor struct {
	R float64 `json:"r"`
	G float64 `json:"g"`
	B float64 `json:"b"`
	A float64 `json:"a"`
}

func (c WGMaterialColor) toRichColor() color.RichColor {
	rich := color.RichColor{}
	rich.Reflective.R = c.R
	rich.Reflective.G = c.G
	rich.Reflective.B = c.B
	rich.Transparency = 1 - c.A
	return rich
}

type WGPhaseDiagramPointData struct {
	P float64
	T float64
}

type WGMaterialData struct {
	ID     string `json:"id"`
	Colors struct {
		Solid  WGMaterialColor `json:"solid"`
		Liquid WGMaterialColor `json:"liquid"`
		Gas    WGMaterialColor `json:"gas"`
	} `json:"colors"`
	Phases struct {
		Type            string                    `json:"type"`
		Triple          WGPhaseDiagramPointData   `json:"triple"`
		SublimationLine []WGPhaseDiagramPointData `json:"subl"`
		MeltingLine     []WGPhaseDiagramPointData `json:"melt"`
		BoilingLine     []WGPhaseDiagramPointData `json:"boil"`
	} `json:"phases"`
	Tags      []string `json:"tags"`
	Abundance struct {
		Min float64 `json:"min"`
		Max float64 `json:"max"`
	} `json:"abundance"`
	MolarMass       float64 `json:"molar"`
	GreenhouseCoeff float64 `json:"greenhouse"`
}

func LoadWGMaterials() ([]*material.Material, error) {
	assetNames, err := globalLoader.loadDirectoryAssets(globalLoader.assetName("worldgen", "materials"))
	if err != nil {
		return nil, err
	}

	result := make([]*material.Material, 0, len(assetNames))

	for _, assetName := range assetNames {
		data := WGMaterialData{}
		data.Colors.Solid.A = 1
		data.Colors.Liquid.A = 1
		data.Colors.Gas.A = 1

		err = globalLoader.loadJSONAsset(assetName, &data)
		if err != nil {
			return nil, err
		}

		matBuilder := material.NewMaterial(data.ID)

		matBuilder.SetColorFor(material.StateSolid, data.Colors.Solid.toRichColor())
		matBuilder.SetColorFor(material.StateLiquid, data.Colors.Liquid.toRichColor())
		matBuilder.SetColorFor(material.StateGas, data.Colors.Gas.toRichColor())

		matBuilder.SetTags(data.Tags)
		matBuilder.SetAbundance(data.Abundance.Min, data.Abundance.Max)
		matBuilder.SetMolarMass(data.MolarMass)

		switch data.Phases.Type {
		case "he":
			matBuilder.SetPhaseDiagram(material.NewHeliumPhaseDiagram(
				parsePhaseDiagramLine(data.Phases.MeltingLine),
				parsePhaseDiagramLine(data.Phases.BoilingLine),
			))

		case "melt":
			matBuilder.SetPhaseDiagram(material.NewMeltPhaseDiagram(parsePhaseDiagramLine(data.Phases.MeltingLine)))

		case "triple":
			fallthrough
		default:
			matBuilder.SetPhaseDiagram(material.NewTriplePointPhaseDiagram(
				data.Phases.Triple.parsePhaseDiagramPoint(),
				parsePhaseDiagramLine(data.Phases.SublimationLine),
				parsePhaseDiagramLine(data.Phases.MeltingLine),
				parsePhaseDiagramLine(data.Phases.BoilingLine),
			))
		}

		result = append(result, matBuilder.Result())
	}

	return result, nil
}

func (dp WGPhaseDiagramPointData) parsePhaseDiagramPoint() material.PhaseDiagramPoint {
	return material.PhaseDiagramPoint{
		T: phys.Kelvins(dp.T),
		P: phys.Pascals(dp.P),
	}
}
func parsePhaseDiagramLine(data []WGPhaseDiagramPointData) []material.PhaseDiagramPoint {
	result := make([]material.PhaseDiagramPoint, 0, len(data))
	for _, dp := range data {
		result = append(result, dp.parsePhaseDiagramPoint())
	}
	return result
}
