package main

import (
	"srv/internal/game/worldgen"
	"srv/internal/globals"
	"srv/internal/globals/assets"
	"srv/internal/globals/config"
	"srv/internal/globals/globaldata"
	"srv/internal/utils/cmdutils"
)

func main() {
	globals.Init()

	wgen := worldgen.NewWorldGen(config.World().Seed)

	grid := wgen.GenerateGrid(&worldgen.GalacticGridGeneratorOptions{
		NRings:            12,
		MinSectors:        16,
		NSectorsIncrement: 2,
	})

	cmdutils.Ensure(assets.SaveGalacticGrid(grid))

	staticRecipes := globaldata.Crafting().CreateAllStaticRecipes()
	cmdutils.Ensure(assets.SaveStaticRecipes(staticRecipes))
}
