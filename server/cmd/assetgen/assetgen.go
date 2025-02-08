package main

import (
	"srv/internal/globals"
	"srv/internal/globals/assets"
	"srv/internal/globals/config"
	"srv/internal/utils/cmdutils"
	"srv/internal/world/worldgen"
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
}
